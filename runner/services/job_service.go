package services

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"gitlab.com/utopiops-water/ao-runner/config"
	"gitlab.com/utopiops-water/ao-runner/models"
	"gitlab.com/utopiops-water/ao-runner/shared"
)

const (
	requestTimeout = time.Second * 60
)

func NewJobService(authHelper shared.AuthHelper, httpHelper shared.HttpHelper) JobService {
	return &jobService{
		authHelper: authHelper,
		httpHelper: httpHelper,
	}
}

type JobService interface {
	GetNextJobs(job *models.Job) (taskIds []int, err error)
	GetTaskDetails(executionId int, taskId int) (taskDetails *models.TaskDetails, err error)
	GetExecutionInitialData(executionId int, token string) (initialData map[string]interface{}, err error)
	SetStatus(status string, executionId int, taskId int) error
}

type jobService struct {
	authHelper shared.AuthHelper
	httpHelper shared.HttpHelper
}

type TaskDetails struct {
	Name           string
	Id             int
	Type           string
	Body           TaskBody `json:"body"`
	ServiceAccount string   `json:"serviceAccount"`
	AccountId      string   `json:"accountId"`
}

type TaskBody map[string]interface{}

func (t TaskBody) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t *TaskBody) Scan(value interface{}) error {
	if b, ok := value.([]byte); ok {
		return json.Unmarshal(b, &t)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

func (j *jobService) GetNextJobs(job *models.Job) (taskIds []int, err error) {

	method := http.MethodGet
	url := config.Configs.Endpoints.AoAPI + fmt.Sprintf("/execution/id/%d/next?taskId=%d&status=%s", job.ExecutionId, job.ActionId, job.Status)
	token, err := j.authHelper.GetToken()
	if err != nil {
		return
	}
	headers := []shared.Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", token),
		},
	}

	out, err, statusCode := j.httpHelper.HttpRequest(method, url, nil, headers, 0)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return
	}
	if statusCode != http.StatusOK {
		err = errors.New(fmt.Sprintf("request failed: %d", statusCode))
		return
	}
	var result struct {
		TaskIds []int
	}
	err = json.Unmarshal(out, &result)
	if err != nil {
		return
	}
	taskIds = result.TaskIds
	return
}

func (j *jobService) GetTaskDetails(executionId int, taskId int) (taskDetails *models.TaskDetails, err error) {
	method := http.MethodGet
	url := config.Configs.Endpoints.AoAPI + fmt.Sprintf("/execution/id/%d/task/%d", executionId, taskId)
	token, err := j.authHelper.GetToken()
	if err != nil {
		return
	}
	headers := []shared.Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", token),
		},
	}

	out, err, statusCode := j.httpHelper.HttpRequest(method, url, nil, headers, 0)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return
	}
	if statusCode != http.StatusOK {
		err = errors.New(fmt.Sprintf("request failed: %d", statusCode))
		return
	}
	err = json.Unmarshal(out, &taskDetails)
	return
}

func (j *jobService) GetExecutionInitialData(executionId int, token string) (initialData map[string]interface{}, err error) {
	method := http.MethodGet
	url := fmt.Sprintf("%s/execution/id/%d/initial_data", config.Configs.Endpoints.AoAPI, executionId)
	fmt.Println("url id", url)
	headers := []shared.Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", token),
		},
	}

	out, err, statusCode := j.httpHelper.HttpRequest(method, url, nil, headers, 0)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return
	}
	if statusCode != http.StatusOK {
		err = errors.New(fmt.Sprintf("request failed: %d", statusCode))
		return
	}
	err = json.Unmarshal(out, &initialData)
	return
}
