package executionService

import (
	"encoding/json"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/models"
)

// start first task (initial task) if you call this method wih task id <= 0,
// otherwise start the tasks which will be triggerd if given task id go to given status
func (manager *executionManager) GetNextTask(taskId, executionId int, status, accountId string) (err error) {
	taskIds := make([]int, 0)
	if taskId <= 0 {
		taskId, err = manager.Store.GetInitialTask(noContext, executionId)
		if err != nil {
			log.Println(err.Error())
			return
		}
		taskIds = append(taskIds, taskId)
	} else {
		taskIds, err = manager.Store.GetNextTasks(noContext, executionId, taskId, status)
		if err != nil {
			log.Println(err.Error())
			return
		}
	}
	for _, taskId := range taskIds {
		task, err := manager.Store.GetTaskByExecution(noContext, executionId, taskId)
		if err != nil {
			return err
		}
		jobDTO := models.NewJob(task, executionId, accountId)
		if task.Integration != "" {
			integration, err := manager.IntegrationService.GetIntegrationByName(accountId, task.Integration)
			if err != nil {
				return err
			}
			jobDTO.SetIntegration(integration)
		}
		body, err := manager.mapFields(executionId, accountId, jobDTO.Body)
		if err == nil {
			jobDTO.Body = body
		}
		err = manager.QueueService.QueueTasks(accountId, "default", jobDTO)
		if err != nil {
			log.Println(err.Error())
			return err
		}
		manager.UtopiopsService.IncrementUsedTimes(models.AvaliableTasks[task.Type].Author, "task", task.Type)
	}
	return nil
}

type insertDto struct {
	Source string `json:"source"`
	Key    string `json:"key"`
}

// check each field in body and looks for value for a filed in a task return value or trigger initial data if needed
func (manager *executionManager) mapFields(execId int, accountId string, taskBody map[string]interface{}) (map[string]interface{}, error) {
	for key, value := range taskBody {
		var insertDt insertDto
		b, _ := json.Marshal(value)
		err := json.Unmarshal(b, &insertDt)
		if err == nil && insertDt.Key != "" && insertDt.Source != "" {
			body, err := manager.CheckExecutionInitialData(execId, accountId, insertDt.Source)
			if err != nil {
				body, err = manager.CheckReturnValues(execId, accountId, insertDt.Source)
				if err != nil {
					return nil, err
				}
			}
			if _, ok := body[insertDt.Key]; !ok {
				return nil, errors.New("no value for this field in initial data or return values")
			}
			taskBody[key] = body[insertDt.Key]
		}
	}
	return taskBody, nil
}
