package executionService

import (
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/utopiops/automated-ops/ao-api/models"
)

func (manager *executionManager) GetNextTask(taskId, executionId int, status, accountId string) error {
	if taskId <= 0 {
		fmt.Println("taskId <= 0", executionId)
		taskId, err := manager.Store.GetInitialTask(noContext, executionId)
		if err != nil {
			log.Println(err.Error())
			return err
		}
		task, err := manager.Store.GetTaskByExecution(noContext, executionId, taskId)
		if err != nil {
			return err
		}
		image := models.AvaliableTasks[task.Type].Image
		/*if !ok {
			return errors.New("no image for this task")
		}*/
		jobDTO := job{
			ExecutionId: executionId,
			TaskId:      task.Id,
			Type:        task.Type,
			Timeout:     task.Timeout,
			Image:       image,
			Body:        task.Body,
			Name:        task.Name,
			AccountId:   accountId,
			MetaData:    models.AvaliableTasks[task.Type],
		}
		body, err := manager.mapFields(executionId, accountId, jobDTO.Body)
		if err != nil {
			return err
		}
		jobDTO.Body = body
		err = manager.QueueService.QueueTasks(accountId, "default", jobDTO)
		if err != nil {
			log.Println(err.Error())
			return err
		}
		return nil
	} else {
		taskIds, err := manager.Store.GetNextTasks(noContext, executionId, taskId, status)
		//fmt.Println("taskId", taskId)
		//fmt.Println("executionId", executionId)
		//fmt.Println("status", status)
		//fmt.Println("taskIds", taskIds)
		if err != nil {
			log.Println(err.Error())
			return err
		}
		for _, taskId := range taskIds {
			task, err := manager.Store.GetTaskByExecution(noContext, executionId, taskId)
			if err != nil {
				return err
			}
			image := models.AvaliableTasks[task.Type].Image
			/*if image == "" {
				return errors.New("no image for this task")
			}*/
			jobDTO := job{
				ExecutionId: executionId,
				TaskId:      task.Id,
				Type:        task.Type,
				Timeout:     task.Timeout,
				Image:       image,
				Body:        task.Body,
				Name:        task.Name,
				AccountId:   accountId,
				MetaData:    models.AvaliableTasks[task.Type],
			}
			body, err := manager.mapFields(executionId, accountId, jobDTO.Body)
			if err != nil {
				return err
			}
			jobDTO.Body = body
			err = manager.QueueService.QueueTasks(accountId, "default", jobDTO)
			if err != nil {
				log.Println(err.Error())
				return err
			}
		}
		return nil
	}
}

type job struct {
	ExecutionId int                    `json:"executionId"`
	TaskId      int                    `json:"taskId"`
	Timeout     int                    `json:"timeout"`
	Name        string                 `json:"name"`
	Type        string                 `json:"type"`
	Image       string                 `json:"image"`
	AccountId   string                 `json:"account_id"`
	Body        map[string]interface{} `json:"body"`
	MetaData    models.TaskDefinition  `json:"task_meta_data"`
}

func (manager *executionManager) mapFields(execId int, accountId string, taskBody map[string]interface{}) (map[string]interface{}, error) {
	for key, value := range taskBody {
		stringValue := fmt.Sprintf("%v", value)
		if strings.Contains(stringValue, "$$$") {
			source := strings.ReplaceAll(stringValue, "$$$", "")
			body, err := manager.CheckExecutionInitialData(execId, accountId, source)
			if err != nil {
				body, err = manager.CheckReturnValues(execId, accountId, source)
				if err != nil {
					return nil, err
				}
			}
			if _, ok := body[key]; !ok {
				return nil, errors.New("no value for this field in initial data or return values")
			}
			taskBody[key] = body[key]
		}
	}
	return taskBody, nil
}
