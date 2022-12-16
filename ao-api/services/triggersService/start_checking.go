package triggerService

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/sirupsen/logrus"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/executionService"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
	"github.com/dotenx/dotenx/ao-api/stores/triggerStore"
)

type dockerCleint struct {
	cli *client.Client
}

/*
This function (currently) finds all the triggers and check if they have to start the pipelines they belong to
*/
func (manager *TriggerManager) StartChecking(store integrationStore.IntegrationStore) error {
	// freq, err := strconv.Atoi(config.Configs.App.CheckTrigger)
	// if err != nil {
	// 	return err
	// }
	frequencyListStr := strings.Split(config.Configs.TaskAndTrigger.FrequencyList, ",")
	var frequencyList = make([]int, 0)
	for _, fStr := range frequencyListStr {
		f, _ := strconv.Atoi(fStr)
		frequencyList = append(frequencyList, f)
	}
	for _, f := range frequencyList {
		go manager.check(store, f)
	}
	// for {
	// todo: handle error
	// TODO: handle this more efficiently and cater for different trigger intervals
	// time.Sleep(time.Duration(freq) * time.Second)
	// }
	return nil
}

func (manager *TriggerManager) check(store integrationStore.IntegrationStore, frequency int) error {
	for {
		triggers := make([]models.EventTrigger, 0)
		redisKey := "ao-api-trigger-frequency-" + fmt.Sprint(frequency)
		exist, pipelineEndpoints, err := manager.RedisStore.GetRedisSortedSet(redisKey)
		if err != nil || !exist {
			if err != nil {
				logrus.Error(err.Error())
			}
			time.Sleep(time.Duration(frequency) * time.Second)
			continue
		}
		for _, endpoint := range pipelineEndpoints {
			t, err := manager.GetAllTriggersForPipelineByEndpoint(endpoint)
			if err != nil {
				logrus.Error(err.Error())
				continue
			}
			triggers = append(triggers, t...)
		}
		cli, err := client.NewClientWithOpts()
		if err != nil {
			fmt.Println("Unable to create docker client")
			time.Sleep(time.Duration(frequency) * time.Second)
			continue
		}
		dc := dockerCleint{cli: cli}

		for _, trigger := range triggers {
			pipeline, err := manager.PipelineStore.GetPipelineByEndpoint(context.Background(), trigger.Endpoint)
			if err != nil {
				fmt.Println("Unable to start checking this trigger:", err.Error())
				continue
			}
			if trigger.Type != "Schedule" && pipeline.IsActive && !pipeline.IsTemplate && !pipeline.IsInteraction {
				go dc.handleTrigger(manager.Store, manager.ExecutionService, manager.IntegrationService, trigger.AccountId, trigger, store, utils.GetNewUuid())
				manager.UtopiopsService.IncrementUsedTimes(models.AvaliableTriggers[trigger.Type].Author, "trigger", trigger.Type)
			}
		}
		time.Sleep(time.Duration(frequency) * time.Second)
	}
	return nil
}

func (dc dockerCleint) handleTrigger(triggerStore triggerStore.TriggerStore, execService executionService.ExecutionService, service integrationService.IntegrationService, accountId string, trigger models.EventTrigger, store integrationStore.IntegrationStore, workspace string) {
	integration, err := service.GetIntegrationByName(accountId, trigger.Integration)
	if err != nil {
		log.Printf("An error occured when trying to call GetIntegrationByName function in trigger %s and integration %s\n", trigger.Name, trigger.Integration)
		log.Println("error:", err.Error())
		return
	}
	img := models.AvaliableTriggers[trigger.Type].Image
	pipelineUrl := fmt.Sprintf("%s/public/execution/ep/%s/start", config.Configs.Endpoints.AoApiLocal, trigger.Endpoint)
	envs := []string{
		"PIPELINE_ENDPOINT=" + pipelineUrl,
		"TRIGGER_NAME=" + trigger.Name,
		"WORKSPACE=" + workspace,
		"ACCOUNT_ID=" + accountId}
	for key, value := range integration.Secrets {
		envs = append(envs, "INTEGRATION_"+key+"="+value)
	}
	for key, value := range trigger.Credentials {
		envs = append(envs, key+"="+value.(string))
	}
	// if config.Configs.App.RunLocally {
	// 	dc.checkTrigger(trigger.Name, img, envs)
	// } else {
	dc.invokeAwsLambda(triggerStore, execService, trigger, img, envs)
	// }
}

func (dc dockerCleint) checkTrigger(triggerName, img string, envs []string) {
	/*reader*/ _, err := dc.cli.ImagePull(context.Background(), img, types.ImagePullOptions{})
	if err != nil {
		log.Println("error in pulling base image " + err.Error())
		return
	}
	//io.Copy(os.Stdout, reader) // to get pull image log
	var cont container.ContainerCreateCreatedBody
	networkConfig := &network.NetworkingConfig{
		EndpointsConfig: map[string]*network.EndpointSettings{},
	}
	gatewayConfig := &network.EndpointSettings{
		Gateway: "local",
	}
	networkConfig.EndpointsConfig["local"] = gatewayConfig
	cont, err = dc.cli.ContainerCreate(
		context.Background(),
		&container.Config{
			Image: img,
			Env:   envs,
		},
		&container.HostConfig{
			Mounts: []mount.Mount{
				{
					Type:   mount.TypeBind,
					Source: config.Configs.App.FileSharing,
					Target: "/tmp",
				},
			},
		}, networkConfig, nil, "")

	if err != nil {
		log.Println("error in creating container" + err.Error())
		return
	}
	err = dc.cli.ContainerStart(context.Background(), cont.ID, types.ContainerStartOptions{})
	if err != nil {
		log.Println("error in starting container" + err.Error())
		return
	}
	for {
		st, err := dc.cli.ContainerInspect(context.Background(), cont.ID)
		if err != nil {
			log.Println(err.Error())
			return
		}
		if !st.State.Running {
			break
		}
	}
	logs, err := dc.GetLogs(cont.ID)
	if err != nil {
		log.Println(err.Error())
	}
	fmt.Println("container: " + cont.ID + "###########   " + triggerName + " log: ")
	fmt.Println(logs)
	fmt.Println("##########################")
}
func (dc dockerCleint) GetLogs(containerId string) (string, error) {
	reader, err := dc.cli.ContainerLogs(context.Background(), containerId, types.ContainerLogsOptions{ShowStdout: true})
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(reader)
	logs := buf.String()
	return logs, err
}

func (dc dockerCleint) invokeAwsLambda(triggerStore triggerStore.TriggerStore, execService executionService.ExecutionService, trigger models.EventTrigger, img string, envs []string) {
	awsRegion := config.Configs.Secrets.AwsRegion
	accessKeyId := config.Configs.Secrets.AwsAccessKeyId
	secretAccessKey := config.Configs.Secrets.AwsSecretAccessKey
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region:      &awsRegion,
			Credentials: credentials.NewStaticCredentials(accessKeyId, secretAccessKey, string("")),
		},
	}))
	svc := lambda.New(sess)

	lambdaPayload := make(map[string]string)
	for _, env := range envs {
		key := strings.Split(env, "=")[0]
		value := strings.Split(env, "=")[1]
		lambdaPayload[key] = value
	}
	payload, err := json.Marshal(lambdaPayload)
	if err != nil {
		log.Println("error in json.Marshal: " + err.Error())
		return
	}
	functionName := strings.ReplaceAll(img, ":", "-")
	functionName = strings.ReplaceAll(functionName, "/", "-")
	logType := "Tail"
	log.Println("triggerName:", trigger.Name)
	log.Println("functionName:", functionName)
	log.Println("payload:", string(payload))
	input := &lambda.InvokeInput{
		FunctionName: &functionName,
		Payload:      payload,
		LogType:      &logType,
	}
	lambdaResult, err := svc.Invoke(input)
	if err != nil {
		log.Println("error in invoking lambda function: " + err.Error())
		return
	}
	log.Printf("Full log of function %s:\n%s\n", functionName, lambdaResult.GoString())
	if lambdaResult.LogResult != nil {
		logs, _ := base64.StdEncoding.DecodeString(*lambdaResult.LogResult)
		log.Println("function log:", string(logs))
	} else {
		log.Println("function payload:", string(lambdaResult.Payload))
	}
	if lambdaResult.FunctionError != nil {
		log.Println("error during function execution: " + *lambdaResult.FunctionError)
		return
	}
	if *lambdaResult.StatusCode != http.StatusOK {
		log.Println("error after invoking lambda function. status code: " + strconv.Itoa(int(*lambdaResult.StatusCode)))
		return
	}

	type Response struct {
		Triggered   bool                   `json:"triggered"`
		ReturnValue map[string]interface{} `json:"return_value"`
	}
	var lambdaResp = Response{}
	err = json.Unmarshal(lambdaResult.Payload, &lambdaResp)
	if err != nil {
		log.Println("error while unmarshalling function response: " + err.Error())
		return
	}

	if lambdaResp.Triggered {
		filteredValues, err := filterTriggersByStrategy(triggerStore, lambdaResp.ReturnValue[trigger.Name].([]interface{}), trigger.AccountId, trigger.ProjectName, trigger.Pipeline, trigger.Name, trigger.MetaData.Strategy)
		if err != nil {
			logrus.Error("error while filtering return values of pipeline:", err.Error())
			return
		}
		for _, singleTrigger := range filteredValues {
			returnValue := lambdaResp.ReturnValue
			returnValue[trigger.Name] = singleTrigger
			res, err := execService.StartPipelineByName(returnValue, trigger.AccountId, trigger.Pipeline, "", "", trigger.ProjectName)
			if err != nil {
				logrus.Println("error while starting pipeline: " + err.Error())
				return
			}
			logrus.Printf("pipeline started successfully: %v\n", res)
		}
	}
}

func filterTriggersByStrategy(tStore triggerStore.TriggerStore, returnValues []interface{}, accountId, projectName, pipelineName, triggerName, strategy string) (filteredValues []interface{}, err error) {
	filteredValues = make([]interface{}, 0)
	if strategy == "" || strategy == "compare_with_list" {
		oldlist, err := tStore.GetTriggerObjectListByTriggerName(context.Background(), accountId, projectName, pipelineName, triggerName)
		if (err != nil && err.Error() == "trigger object list not found") || oldlist == nil {
			// TODO (nice to have): check that newList length has bounded to 100
			newList := make(models.TriggerObjectList)
			for _, singleValue := range returnValues {
				newList[fmt.Sprint(singleValue.(map[string]interface{})["id"])] = time.Now().UnixNano()
				filteredValues = append(filteredValues, singleValue)
			}
			insertErr := tStore.AddTriggerObjectList(context.Background(), models.TriggerChecker{
				AccountId:    accountId,
				ProjectName:  projectName,
				PipelineName: pipelineName,
				TriggerName:  triggerName,
				List:         newList,
			})
			if insertErr != nil {
				return nil, insertErr
			}
		} else if err == nil {
			keys := make([]string, 0)
			for key := range oldlist {
				keys = append(keys, key)
			}
			sort.SliceStable(keys, func(i, j int) bool {
				return oldlist[keys[i]].(float64) < oldlist[keys[j]].(float64)
			})
			newList := oldlist
			deletedInd := 0
			for _, singleValue := range returnValues {
				id := fmt.Sprint(singleValue.(map[string]interface{})["id"])
				if newList[id] != nil {
					continue
				}
				if len(newList) >= 100 {
					delete(newList, keys[deletedInd])
					deletedInd++
				}
				newList[id] = time.Now().UnixNano()
				filteredValues = append(filteredValues, singleValue)
			}
			updateErr := tStore.UpdateTriggerObjectListByTriggerName(context.Background(), models.TriggerChecker{
				AccountId:    accountId,
				ProjectName:  projectName,
				PipelineName: pipelineName,
				TriggerName:  triggerName,
				List:         newList,
			})
			if updateErr != nil {
				return nil, updateErr
			}
		} else {
			return nil, err
		}
		return filteredValues, nil
	} else if strategy == "compare_with_last" {
		oldlist, err := tStore.GetTriggerObjectListByTriggerName(context.Background(), accountId, projectName, pipelineName, triggerName)
		if (err != nil && err.Error() == "trigger object list not found") || oldlist == nil {
			newList := make(models.TriggerObjectList)
			var latestId interface{} = nil
			for _, singleValue := range returnValues {
				idStr := fmt.Sprint(singleValue.(map[string]interface{})["id"])
				idInt, convErr := strconv.ParseFloat(idStr, 64)
				if convErr == nil {
					if latestId == nil {
						latestId = 0
					}
					if idInt > latestId.(float64) {
						latestId = idInt
					}
				} else {
					if latestId == nil {
						latestId = ""
					}
					if idStr > fmt.Sprint(latestId) {
						latestId = idStr
					}
				}
				filteredValues = append(filteredValues, singleValue)
			}
			newList[fmt.Sprint(latestId)] = time.Now().UnixNano()
			insertErr := tStore.AddTriggerObjectList(context.Background(), models.TriggerChecker{
				AccountId:    accountId,
				ProjectName:  projectName,
				PipelineName: pipelineName,
				TriggerName:  triggerName,
				List:         newList,
			})
			if insertErr != nil {
				return nil, insertErr
			}
		} else if err == nil {
			keys := make([]string, 0)
			for key := range oldlist {
				keys = append(keys, key)
			}
			sort.SliceStable(keys, func(i, j int) bool {
				idIntI, convErrI := strconv.ParseFloat(keys[i], 64)
				idIntJ, convErrJ := strconv.ParseFloat(keys[j], 64)
				if convErrI == nil && convErrJ == nil {
					return idIntI < idIntJ
				}
				return keys[i] < keys[j]
			})
			newList := make(models.TriggerObjectList)
			oldLatestId := keys[len(keys)-1]
			var latestId interface{} = keys[len(keys)-1]
			for _, singleValue := range returnValues {
				idStr := fmt.Sprint(singleValue.(map[string]interface{})["id"])
				cIdInt, convErr1 := strconv.ParseFloat(idStr, 64)
				oldIdInt, convErr2 := strconv.ParseFloat(oldLatestId, 64)
				if convErr1 == nil && convErr2 == nil {
					if cIdInt > oldIdInt {
						filteredValues = append(filteredValues, singleValue)
					}
					lIdInt, _ := strconv.ParseFloat(fmt.Sprint(latestId), 64)
					if cIdInt > lIdInt {
						latestId = cIdInt
					}
				} else {
					if idStr > oldLatestId {
						filteredValues = append(filteredValues, singleValue)
					}
					if idStr > fmt.Sprint(latestId) {
						latestId = idStr
					}
				}
			}
			newList[fmt.Sprint(latestId)] = time.Now().UnixNano()
			updateErr := tStore.UpdateTriggerObjectListByTriggerName(context.Background(), models.TriggerChecker{
				AccountId:    accountId,
				ProjectName:  projectName,
				PipelineName: pipelineName,
				TriggerName:  triggerName,
				List:         newList,
			})
			if updateErr != nil {
				return nil, updateErr
			}
		} else {
			return nil, err
		}
		return filteredValues, nil
	} else {
		return nil, errors.New("unsupported strategy")
	}
}
