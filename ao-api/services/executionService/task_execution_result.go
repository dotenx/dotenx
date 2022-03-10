package executionService

import (
	"log"

	"github.com/utopiops/automated-ops/ao-api/models"
)

func (manager *executionManager) SetTaskExecutionResult(executionId int, taskId int, taskStatus string) error {
	err := manager.Store.SetTaskResult(noContext, executionId, taskId, taskStatus)
	if err != nil {
		log.Println(err.Error())
		return err
	}
	return nil
}
func (manager *executionManager) SetTaskExecutionResultDetailes(executionId int, taskId int, taskStatus string, returnValue models.ReturnValueMap, logs string) error {
	err := manager.Store.SetTaskResultDetailes(noContext, executionId, taskId, taskStatus, returnValue, logs)
	if err != nil {
		log.Println(err.Error())
		return err
	}
	return nil
}

func (manager *executionManager) GetTaskExecutionResult(executionId int, taskId int) (interface{}, error) {
	res, err := manager.Store.GetTaskResultDetailes(noContext, executionId, taskId)
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}
	return res, nil
}
