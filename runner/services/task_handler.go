package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"

	"gitlab.com/utopiops-water/ao-runner/config"
	"gitlab.com/utopiops-water/ao-runner/models"
	"gitlab.com/utopiops-water/ao-runner/shared"
)

type QueueMessage struct {
	Action      string
	ExecutionId int
	PipelineId  int
	Input       map[string]interface{}
}

type workerMessage struct {
	TaskDetails *TaskDetails
	DataBag     map[string]interface{}
	ExecutionId int
}

func dispatchTasks(taskIds []int, executionId int, dataBag map[string]interface{}, jobService JobService, httpHelper shared.HttpHelper, authHelper shared.AuthHelper) (<-chan *models.TaskDetails, chan int) {
	fmt.Println("dispatchTasks")
	errors := make(chan int, len(taskIds))
	//var wg sync.WaitGroup
	taskDetailsChannel := substituteTasksBodies(getTasksDetails(executionId, taskIds, jobService, errors), errors, executionId, jobService, httpHelper, authHelper)
	//wg.Wait()
	return taskDetailsChannel, errors
}

func substituteTaskBody(rawTask *models.TaskDetails, executionId int, jobService JobService, httpHelper shared.HttpHelper, authHelper shared.AuthHelper) (dispatchableTask *models.TaskDetails, err error) {

	dispatchableTask = &models.TaskDetails{
		Name:           rawTask.Name,
		Type:           rawTask.Type,
		Id:             rawTask.Id,
		AccountId:      rawTask.AccountId,
		ServiceAccount: rawTask.ServiceAccount,
		Body:           make(map[string]interface{}),
	}

	fmt.Println("inside substituteTaskBody", rawTask)

	var token string
	fmt.Println("getServiceAccountToken")
	token, err = getServiceAccountToken(rawTask.ServiceAccount, rawTask.AccountId, httpHelper, authHelper)
	fmt.Println("token", token)
	if err != nil {
		return
	}

	// For each field in the task body, if it's a variable it should be substituted at this point
	for k, v := range rawTask.Body {
		str := fmt.Sprintf("%v", v)
		fmt.Println("str", str)
		if shared.IsVariable(str) {
			valueParts := strings.Split(str[1:], ".")
			fmt.Println(valueParts)
			switch valueParts[0] {
			case "secret":
				fmt.Println("is secret")
				// jobService.GetPipelineServiceAccount(executionId)
				if len(rawTask.ServiceAccount) == 0 {
					err = errors.New(fmt.Sprintf("Not authorized to access %s", v))
					return
				}
				var secret string
				secret, err = getSecret(rawTask.AccountId, valueParts[1], token, httpHelper, authHelper)
				fmt.Println("secret", secret)
				if err != nil {
					return
				}
				dispatchableTask.Body[k] = secret

			case "input":
				var initialData map[string]interface{}
				initialData, err = jobService.GetExecutionInitialData(executionId, token)
				if err != nil {
					fmt.Println("id error:::", err.Error())
					return
				}
				fmt.Println("initialData", initialData)
				if val, ok := initialData[valueParts[1]]; ok {
					if valString, isString := val.(string); isString {
						dispatchableTask.Body[k] = valString
						continue
					}
				}
				err = errors.New(fmt.Sprintf("Invalid input $s", v))
			}

		} else {
			dispatchableTask.Body[k] = v
		}
	}
	return
}

func getTasksDetails(executionId int, taskIds []int, jobService JobService, errors chan<- int) <-chan *models.TaskDetails {
	tasks := make(chan *models.TaskDetails)
	var wg sync.WaitGroup
	go func() {
		for _, taskId := range taskIds {
			fmt.Println("processing task: ", taskId)
			wg.Add(1)
			go func(id int) {
				defer wg.Done()
				taskDetails, err := jobService.GetTaskDetails(executionId, id)
				fmt.Println("got taskDetails")
				if err != nil {
					fmt.Println("error", err)
					errors <- id
				} else {
					tasks <- taskDetails
				}
			}(taskId)
		}
		wg.Wait()
		fmt.Println("waited 1")
		close(tasks)
		fmt.Println("Closed Tasks")
	}()

	return tasks
}

func substituteTasksBodies(tasks <-chan *models.TaskDetails, errors chan<- int, executionId int, jobService JobService, httpHelper shared.HttpHelper, authHelper shared.AuthHelper) <-chan *models.TaskDetails {
	fmt.Println("in substituteTasksBodies")
	dispatchableTasks := make(chan *models.TaskDetails)
	var wg sync.WaitGroup
	go func() {
		for task := range tasks {
			fmt.Println("substituteTaskBody task", task)
			// prepare message based on the job details
			wg.Add(1)
			go func(t *models.TaskDetails) {
				substitutedTask, err := substituteTaskBody(t, executionId, jobService, httpHelper, authHelper)
				defer wg.Done()
				if err != nil {
					fmt.Println("err", err.Error())
					errors <- t.Id
				} else {
					dispatchableTasks <- substitutedTask
				}
			}(task)
		}
		wg.Wait()
		fmt.Println("waited 2")
		close(dispatchableTasks)
		close(errors)
		fmt.Println("Closed dispatchableTasks")
	}()
	return dispatchableTasks
}

func getServiceAccountToken(serviceAccountName, accountId string, httpHelper shared.HttpHelper, authHelper shared.AuthHelper) (token string, err error) {

	method := http.MethodPost
	url := config.Configs.Endpoints.Core + "/auth/apps/service_account/token"
	appToken, err := authHelper.GetToken()
	if err != nil {
		return
	}
	headers := []shared.Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", appToken),
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}

	values := map[string]string{"serviceAccountName": serviceAccountName, "accountId": accountId}
	jsonData, err := json.Marshal(values)

	out, err, statusCode := httpHelper.HttpRequest(method, url, bytes.NewBuffer(jsonData), headers, 0)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return
	}
	if statusCode != http.StatusOK {
		fmt.Println("Status code: ", statusCode)
		err = errors.New(fmt.Sprintf("request failed: %d", statusCode))
		return
	}
	var t struct {
		Token string
	}
	err = json.Unmarshal(out, &t)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	return t.Token, nil
}

func getSecret(accountId, secretName, token string, httpHelper shared.HttpHelper, authHelper shared.AuthHelper) (secret string, err error) {

	method := http.MethodGet
	url := fmt.Sprintf("%s/simple/%s/value", config.Configs.Endpoints.SecretManager, secretName)
	fmt.Println("url", url)
	headers := []shared.Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", token),
		},
	}

	out, err, statusCode := httpHelper.HttpRequest(method, url, nil, headers, 0)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return
	}
	if statusCode != http.StatusOK {
		fmt.Println("Status code: ", statusCode)
		err = errors.New(fmt.Sprintf("request failed: %d", statusCode))
		return
	}
	secret = string(out)
	return
}
