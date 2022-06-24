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
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
)

type dockerCleint struct {
	cli *client.Client
}

func (manager *TriggerManager) StartChecking(store integrationStore.IntegrationStore) error {
	freq, err := strconv.Atoi(config.Configs.App.CheckTrigger)
	if err != nil {
		return err
	}
	for {
		// todo: handle error
		go manager.check(store)
		time.Sleep(time.Duration(freq) * time.Second)
		//time.Sleep(time.Duration(5) * time.Second)
	}
}
func (manager *TriggerManager) check(store integrationStore.IntegrationStore) error {
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
	//fmt.Println(triggers)
	for _, trigger := range triggers {
		_, _, isActive, err := manager.PipelineStore.GetByName(context.Background(), trigger.AccountId, trigger.Pipeline)
		if err != nil {
			fmt.Println("Unable to start checking this trigger:", err.Error())
			continue
		}
		if trigger.Type != "Schedule" && isActive {
			go dc.handleTrigger(manager.IntegrationService, trigger.AccountId, trigger, store, utils.GetNewUuid())
			manager.UtopiopsService.IncrementUsedTimes(models.AvaliableTriggers[trigger.Type].Author, "trigger", trigger.Type)
		}
	}
	return nil
}

func (dc dockerCleint) handleTrigger(service integrationService.IntegrationService, accountId string, trigger models.EventTrigger, store integrationStore.IntegrationStore, workspace string) {
	integration, err := service.GetIntegrationByName(accountId, trigger.Integration)
	if err != nil {
		return
	}
	img := models.AvaliableTriggers[trigger.Type].Image
	pipelineUrl := fmt.Sprintf("%s/execution/ep/%s/start", config.Configs.Endpoints.AoApiLocal, trigger.Endpoint)
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
		dc.invokeAwsLambda(trigger.Name, img, envs)
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

func (dc dockerCleint) invokeAwsLambda(triggerName, img string, envs []string) {
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
	log.Println("triggerName:", triggerName)
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
}
