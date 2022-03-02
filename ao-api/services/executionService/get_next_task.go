package executionService

import (
	"errors"
	"fmt"
	"log"

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
		image, ok := models.PredefiniedTaskToImage[task.Type]
		if !ok {
			return errors.New("no image for this task")
		}
		jobDTO := job{ExecutionId: executionId,
			TaskId:    task.Id,
			Type:      task.Type,
			Timeout:   task.Timeout,
			Image:     image,
			Body:      task.Body,
			Name:      task.Name,
			AccountId: accountId,
		}
		body, err := manager.CheckExecutionInitialData(executionId, accountId, jobDTO.Name)
		if err == nil {
			jobDTO.Body = body
		} else {
			fmt.Println("error in getting inital body" + err.Error())
		}
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
			image, ok := models.PredefiniedTaskToImage[task.Type]
			if !ok {
				return errors.New("no image for this task")
			}
			jobDTO := job{ExecutionId: executionId,
				TaskId:    task.Id,
				Type:      task.Type,
				Timeout:   task.Timeout,
				Image:     image,
				Body:      task.Body,
				Name:      task.Name,
				AccountId: accountId,
			}
			body, err := manager.CheckExecutionInitialData(executionId, accountId, jobDTO.Name)
			if err == nil {
				jobDTO.Body = body
			}
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
}
