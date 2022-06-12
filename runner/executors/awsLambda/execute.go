package awsLambda

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/dotenx/dotenx/runner/config"
	"github.com/dotenx/dotenx/runner/models"
)

func (executor *lambdaExecutor) Execute(task *models.Task) (result *models.TaskExecutionResult) {
	log.Println(task.EnvironmentVariables)
	result = &models.TaskExecutionResult{}
	result.Id = task.Details.Id
	result.Status = models.StatusFailed
	if task.Details.Image == "" {
		result.Error = errors.New("task dto is invalid and cant be processed")
		return
	}

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
	for _, env := range task.EnvironmentVariables {
		key := strings.Split(env, "=")[0]
		value := strings.Split(env, "=")[1]
		lambdaPayload[key] = value
	}
	payload, err := json.Marshal(lambdaPayload)
	if err != nil {
		result.Error = errors.New("error in json.Marshal: " + err.Error())
		return
	}
	functionName := strings.ReplaceAll(task.Details.Image, ":", "-")
	functionName = strings.ReplaceAll(functionName, "/", "-")
	logType := "Tail"
	log.Println("functionName:", functionName)
	log.Println("payload:", string(payload))
	input := &lambda.InvokeInput{
		FunctionName: &functionName,
		Payload:      payload,
		LogType:      &logType,
	}
	lambdaResult, err := svc.Invoke(input)
	if err != nil {
		result.Error = errors.New("error in invoking lambda function: " + err.Error())
		return
	}
	log.Printf("Full log of function %s:\n%s\n", functionName, lambdaResult.GoString())
	if lambdaResult.LogResult != nil {
		logs, _ := base64.StdEncoding.DecodeString(*lambdaResult.LogResult)
		result.Log = string(logs)
	} else {
		result.Log = string(lambdaResult.Payload)
	}
	if lambdaResult.FunctionError != nil {
		result.Error = errors.New("error during function execution: " + *lambdaResult.FunctionError)
		return
	}
	if *lambdaResult.StatusCode != http.StatusOK {
		result.Error = errors.New("error after invoking lambda function. status code: " + strconv.Itoa(int(*lambdaResult.StatusCode)))
		return
	}

	type Response struct {
		Successfull bool `json:"successfull"`
	}
	var resp = Response{}
	err = json.Unmarshal(lambdaResult.Payload, &resp)
	if err != nil {
		result.Error = errors.New("error unmarshalling function response: " + err.Error())
		return
	}
	if !resp.Successfull {
		result.Error = errors.New("error after invoking lambda function. task was not successfull.")
		return
	}
	result.Status = models.StatusCompleted
	log.Println("log: " + result.Log)
	log.Print("err: ")
	log.Println(result.Error)
	return
}
