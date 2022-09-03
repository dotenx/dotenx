package triggerService

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
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

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/executionService"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
)

type dockerCleint struct {
	cli *client.Client
}

/*
This function (currently) finds all the triggers and check if they have to start the pipelines they belong to
*/
func (manager *TriggerManager) StartChecking(store integrationStore.IntegrationStore) error {
	freq, err := strconv.Atoi(config.Configs.App.CheckTrigger)
	if err != nil {
		return err
	}
	for {
		// todo: handle error
		// TODO: handle this more efficiently and cater for different trigger intervals
		go manager.check(store)
		time.Sleep(time.Duration(freq) * time.Second)
	}
}
func (manager *TriggerManager) check(store integrationStore.IntegrationStore) error {
	// TODO: replace this with GetActiveTriggers which returns the triggers corresponding to a pipeline with (pipeline.IsActive && !pipeline.IsTemplate && !pipeline.IsInteraction)
	triggers, err := manager.GetAllTriggers()
	if err != nil {
		return err
	}
	cli, err := client.NewClientWithOpts()
	if err != nil {
		fmt.Println("Unable to create docker client")
		return err
	}
	dc := dockerCleint{cli: cli}

	for _, trigger := range triggers {
		pipeline, err := manager.PipelineStore.GetPipelineByEndpoint(context.Background(), trigger.Endpoint)
		if err != nil {
			fmt.Println("Unable to start checking this trigger:", err.Error())
			continue
		}
		if trigger.Type != "Schedule" && pipeline.IsActive && !pipeline.IsTemplate && !pipeline.IsInteraction {
			go dc.handleTrigger(manager.ExecutionService, manager.IntegrationService, trigger.AccountId, trigger, store, utils.GetNewUuid())
			manager.UtopiopsService.IncrementUsedTimes(models.AvaliableTriggers[trigger.Type].Author, "trigger", trigger.Type)
		}
	}
	return nil
}

func (dc dockerCleint) handleTrigger(execService executionService.ExecutionService, service integrationService.IntegrationService, accountId string, trigger models.EventTrigger, store integrationStore.IntegrationStore, workspace string) {
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
	if config.Configs.App.RunLocally {
		dc.checkTrigger(trigger.Name, img, envs)
	} else {
		dc.invokeAwsLambda(execService, trigger, img, envs)
	}
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

func (dc dockerCleint) invokeAwsLambda(execService executionService.ExecutionService, trigger models.EventTrigger, img string, envs []string) {
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
		res, err := execService.StartPipelineByName(lambdaResp.ReturnValue, trigger.AccountId, trigger.Pipeline, "", "", trigger.ProjectName)
		if err != nil {
			log.Println("error while starting pipeline: " + err.Error())
			return
		}
		log.Printf("pipeline started successfully: %v\n", res)
	}
}
