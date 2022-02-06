package executionService

import (
	"fmt"
	"log"
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
		jobDTO := job{ExecutionId: executionId,
			TaskId:    task.Id,
			Type:      task.Type,
			Timeout:   task.Timeout,
			Body:      task.Body,
			Name:      task.Name,
			AccountId: accountId,
		}
		err = manager.QueueService.QueueTasks(accountId, "default", jobDTO)
		if err != nil {
			log.Println(err.Error())
			return err
		}
		// job, err := manager.QueueService.DequeueTask(accountId, "default")
		// var newTask models.TaskDetails
		// bytes, err := json.Marshal(job)
		// err = json.Unmarshal(bytes, &newTask)
		// if err != nil {
		// 	return nil, http.StatusInternalServerError
		// }
		return nil
	} else {
		taskIds, err := manager.Store.GetNextTasks(noContext, executionId, taskId, status)
		fmt.Println("taskId", taskId)
		fmt.Println("executionId", executionId)
		fmt.Println("status", status)
		fmt.Println("taskIds", taskIds)
		if err != nil {
			log.Println(err.Error())
			return err
		}
		for _, taskId := range taskIds {
			task, err := manager.Store.GetTaskByExecution(noContext, executionId, taskId)
			if err != nil {
				return err
			}
			jobDTO := job{ExecutionId: executionId,
				TaskId:    task.Id,
				Type:      task.Type,
				Timeout:   task.Timeout,
				Body:      task.Body,
				Name:      task.Name,
				AccountId: accountId,
			}
			err = manager.QueueService.QueueTasks(accountId, "default", jobDTO)
			if err != nil {
				log.Println(err.Error())
				return err
			}
		}
		// job, err := manager.QueueService.DequeueTask(accountId, "default")
		// if err != nil {
		// 	return nil, http.StatusInternalServerError
		// }
		return nil
	}
}

type job struct {
	ExecutionId int                    `json:"executionId"`
	TaskId      int                    `json:"taskId"`
	Timeout     int                    `json:"timeout"`
	Name        string                 `json:"name"`
	Type        string                 `json:"type"`
	AccountId   string                 `json:"account_id"`
	Body        map[string]interface{} `json:"body"`
	//	Task        models.TaskDetails     `json:"task"`
}
