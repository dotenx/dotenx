package executionService

import (
	"log"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (manager *executionManager) SetTaskExecutionStatus(executionId int, taskId int, taskStatus string) error {
	err := manager.Store.SetTaskStatus(noContext, executionId, taskId, taskStatus)
	if err != nil {
		log.Println(err.Error())
		return err
	}
	return nil
}
func (manager *executionManager) SetTaskExecutionResultDetails(executionId int, taskId int, taskStatus string, returnValue models.ReturnValueMap, logs string) error {
	err := manager.Store.SetTaskResultDetails(noContext, executionId, taskId, taskStatus, returnValue, logs)
	if err != nil {
		log.Println(err.Error())
		return err
	}
	return nil
}

func (manager *executionManager) GetTaskExecutionResult(executionId int, taskId int) (interface{}, error) {
	res, err := manager.Store.GetTaskResultDetails(noContext, executionId, taskId)
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}
	return res, nil
}
