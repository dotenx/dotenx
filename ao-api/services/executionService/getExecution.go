package executionService

import "github.com/dotenx/dotenx/ao-api/models"

func (manager *executionManager) GetExecution(accountId string) (interface{}, error) {
	//return manager.redisQueue.GetExecution(accountId)
	return nil, nil
}

func (manager *executionManager) GetExecutionDetails(executionId int) (models.Execution, error) {
	return manager.Store.GetExecutionDetailes(noContext, executionId)
}
