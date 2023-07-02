package executionService

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// ExecuteAllTasksAndReturnResults starts pipline from first (initial) task and wait until pipeline tasks be ended then return results
func (manager *executionManager) ExecuteAllTasksAndReturnResults(pipeline models.PipelineSummery, executionId int) (interface{}, error) {
	initialTaskId, err := manager.Store.GetInitialTask(noContext, executionId)
	if err != nil {
		log.Println(err.Error())
		return -1, err
	}
	errChan := make(chan error, 100)
	resultsChan := make(chan models.TaskResultDto, 100)
	defer close(errChan)
	defer close(resultsChan)
	manager.ExecuteTasks(initialTaskId, executionId, pipeline.AccountId, resultsChan, errChan)
	for {
		select {
		case <-time.After(time.Duration(config.Configs.App.ExecutionTaskTimeLimit) * time.Second):
			err = errors.New("pipeline timeout")
			logrus.Error(err.Error())
			return nil, err
		case err = <-errChan:
			logrus.Error(err.Error())
			return nil, err
		case res := <-resultsChan:
			cnt, err := manager.Store.GetNumberOfRunningTasks(noContext, executionId)
			if err != nil {
				logrus.Error(err.Error())
				return nil, err
			}
			taskIds, err := manager.Store.GetNextTasks(noContext, executionId, res.TaskId, res.Status)
			if err != nil {
				logrus.Error(err.Error())
				return nil, err
			}
			if cnt == 0 && len(taskIds) == 0 {
				if !pipeline.IsInteraction {
					if err != nil {
						logrus.Error(err.Error())
					}
					return gin.H{"id": executionId}, err
				}
				var taskRes = struct {
					Status      string                `json:"status"`
					Error       string                `json:"error"`
					Log         string                `json:"log"`
					ReturnValue models.ReturnValueMap `json:"return_value"`
				}{
					Status:      res.Status,
					Error:       res.Error,
					Log:         res.Log,
					ReturnValue: res.ReturnValue,
				}
				return taskRes, nil
			}
		}
	}
}

// ExecuteTasks gets an initial task and run it then call itself (recursively) for all next tasks (based of results of initial task)
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

	// TODO: check what is workSpace and delete it if isn't useful
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
		if tpAccountId != "" {
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
		} else {
			logrus.Println("task does not have an integration")
		}
	}

	switch task.Type {
	// convert 'Custom task' to 'Run node code'
	case "Custom task":
		jobDTO.PrepRunMiniTasks()
	case "Run node code":
		jobDTO.SetRunCodeFields()
	}
	err = manager.SetTaskExecutionStatus(executionId, initialTaskId, "started")
	if err != nil {
		logrus.Error(err.Error())
		errChan <- err
		return
	}
	// TODO: check why we should set results before executing task
	err = manager.SetTaskExecutionResultDetails(executionId, initialTaskId, "started", map[string]interface{}{}, "")
	if err != nil {
		logrus.Error(err.Error())
		errChan <- err
		return
	}

	// TODO: better error handling, currently we consider errors that are in result variable
	result, _ := manager.Execute(*jobDTO)
	result.TaskId = initialTaskId
	err = manager.SetTaskExecutionStatus(executionId, initialTaskId, result.Status)
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

	// TODO: renaming UtopiopsService
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

// Execute invokes aws lambda function and return results
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

// check each field in body and looks for value for a filed in a task return value or trigger initial data if needed
func (manager *executionManager) mapFields(execId int, accountId string, taskName string, taskBody map[string]interface{}) (map[string]interface{}, error) {
	return manager.getBodyFromSourceData(execId, accountId, taskName, taskBody, map[string]returnValues{})
}

// updateExecutionTasksUsage sends a request to dotenx-admin and add number of tasks to account's plan usage
func (manager *executionManager) updateExecutionTasksUsage(accountId string, tasks int) error {
	dt := executionTaskDto{
		AccountId: accountId,
		Tasks:     tasks,
	}
	jsonData, err := json.Marshal(dt)
	if err != nil {
		return errors.New("bad input body")
	}
	requestBody := bytes.NewBuffer(jsonData)
	token, err := utils.GeneratToken()
	if err != nil {
		return err
	}
	Requestheaders := []utils.Header{
		{
			Key:   "Authorization",
			Value: token,
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	url := config.Configs.Endpoints.Admin + "/internal/execution/task"
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	_, err, status, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		return err
	}
	if status != http.StatusOK && status != http.StatusAccepted {
		logrus.Println("status code:", status)
		return errors.New("not ok with status: " + strconv.Itoa(status))
	}
	return nil
}

type executionTaskDto struct {
	AccountId string `json:"account_id" binding:"required"`
	Tasks     int    `json:"tasks" binding:"required"`
}
