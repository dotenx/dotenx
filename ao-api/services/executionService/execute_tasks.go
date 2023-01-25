package executionService

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
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (manager *executionManager) ExecuteTasks(initialTaskId, executionId int, accountId string, resultsChan chan models.TaskResultDto, errChan chan error) {
	// tpAccountId will be used to get user integration for each task (if needed)
	tpAccountId, err := manager.Store.GetThirdPartyAccountId(noContext, executionId)
	if err != nil {
		logrus.Error(err.Error())
		errChan <- err
		return
	}
	// getting task body from db
	task, err := manager.Store.GetTaskByExecution(noContext, executionId, initialTaskId)
	if err != nil {
		logrus.Error(err.Error())
		errChan <- err
		return
	}
	// create job based on task detailes
	jobDTO := models.NewJob(task, executionId, accountId)
	workSpace, err := manager.CheckExecutionInitialDataForWorkSpace(executionId)
	if err != nil {
		logrus.Error(err.Error())
		errChan <- err
		return
	}
	jobDTO.WorkSpace = workSpace
	// set job body based on task body and execution initial data and other tasks output (if needed)
	body, err := manager.mapFields(executionId, accountId, task.Name, task.Body)
	if err != nil {
		logrus.Error(err.Error())
		errChan <- err
		return
	}
	jobDTO.Body = body
	// adding dynamic values to job metadata for runner to use them in the proccess step
	if jobDTO.MetaData.HasDynamicVariables {
		jobDTO.AddDynamicValuesToMetaData()
	}
	if task.Integration != "" { // setting integration if task has integration directly
		integration, err := manager.IntegrationService.GetIntegrationByName(accountId, task.Integration)
		if err != nil {
			logrus.Error(err.Error())
			errChan <- err
			return
		}
		jobDTO.SetIntegration(integration)
	} else {
		if tpAccountId == "" {
			logrus.Println("task does not have an integration")
		} else {
			// TODO what if for tasks with several types of integrations
			task.MetaData = models.AvaliableTasks[task.Type]
			if len(jobDTO.MetaData.Integrations) > 0 { // check if task needs integration
				logrus.Println(task.MetaData.Integrations[0] + " || " + accountId + " || " + tpAccountId)
				integration, err := manager.IntegrationService.GetIntegrationForThirdPartyAccount(accountId, tpAccountId, task.MetaData.Integrations[0])
				if err != nil {
					logrus.Error(err.Error())
					errChan <- err
					return
				}
				logrus.Println(integration)
				jobDTO.SetIntegration(integration)
			}
		}
	}
	// convert 'Custom task' to 'Run node code'
	if task.Type == "Custom task" {
		jobDTO.PrepRunMiniTasks()
	}
	if task.Type == "Run node code" {
		jobDTO.SetRunCodeFields()
	}
	err = manager.SetTaskExecutionResult(executionId, initialTaskId, "started")
	if err != nil {
		logrus.Error(err.Error())
		errChan <- err
		return
	}
	err = manager.SetTaskExecutionResultDetails(executionId, initialTaskId, "started", map[string]interface{}{}, "")
	if err != nil {
		logrus.Error(err.Error())
		errChan <- err
		return
	}

	result, _ := manager.Execute(*jobDTO)
	result.TaskId = initialTaskId
	err = manager.SetTaskExecutionResult(executionId, initialTaskId, result.Status)
	if err != nil {
		logrus.Error(err.Error())
		errChan <- err
		return
	}
	err = manager.SetTaskExecutionResultDetails(executionId, initialTaskId, result.Status, result.ReturnValue, result.Log)
	if err != nil {
		logrus.Error(err.Error())
		errChan <- err
		return
	}

	manager.UtopiopsService.IncrementUsedTimes(models.AvaliableTasks[task.Type].Author, "task", task.Type)
	err = manager.updateExecutionTasksUsage(accountId, 1)
	if err != nil {
		logrus.Error(err.Error())
		errChan <- err
		return
	}

	taskIds, err := manager.Store.GetNextTasks(noContext, executionId, initialTaskId, result.Status)
	if err != nil {
		logrus.Error(err.Error())
		return
	}
	for _, taskId := range taskIds {
		go manager.ExecuteTasks(taskId, executionId, accountId, resultsChan, errChan)
	}

	resultsChan <- result
}

func (manager *executionManager) Execute(job models.Job) (result models.TaskResultDto, err error) {
	result.Status = models.Failed.String()
	if job.Image == "" {
		result.Error = "task dto is invalid and can't be processed"
		return result, errors.New(result.Error)
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

	lambdaPayload := make(map[string]interface{})
	lambdaPayload["body"] = job.Body
	payload, err := json.Marshal(lambdaPayload)
	if err != nil {
		result.Error = "error in json.Marshal: " + err.Error()
		return result, errors.New(result.Error)
	}
	functionName := strings.ReplaceAll(job.Image, ":", "-")
	functionName = strings.ReplaceAll(functionName, "/", "-")
	if job.AwsLambda != "" {
		functionName = job.AwsLambda
	}
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
		result.Error = "error in invoking lambda function: " + err.Error()
		return result, errors.New(result.Error)
	}

	if lambdaResult.LogResult != nil {
		logs, _ := base64.StdEncoding.DecodeString(*lambdaResult.LogResult)
		result.Log = string(logs)
	} else {
		result.Log = string(lambdaResult.Payload)
	}
	if lambdaResult.FunctionError != nil {
		result.Error = "error during function execution: " + *lambdaResult.FunctionError
		return result, errors.New(result.Error)
	}
	if *lambdaResult.StatusCode != http.StatusOK {
		result.Error = "error after invoking lambda function. status code: " + strconv.Itoa(int(*lambdaResult.StatusCode))
		return result, errors.New(result.Error)
	}

	type Response struct {
		Successfull bool                   `json:"successfull"`
		Status      string                 `json:"status"`
		ReturnValue map[string]interface{} `json:"return_value"`
	}
	var resp = Response{}
	err = json.Unmarshal(lambdaResult.Payload, &resp)
	if err != nil {
		result.Error = "error unmarshalling function response: " + err.Error()
		return result, errors.New(result.Error)
	}
	if !resp.Successfull {
		result.Error = "error after invoking lambda function, task was not successfull"
		return result, errors.New(result.Error)
	}

	log.Println("log: " + result.Log)
	log.Print("err: ")
	log.Println(result.Error)

	result.Status = models.Completed.String()
	result.ReturnValue = resp.ReturnValue
	return
}
