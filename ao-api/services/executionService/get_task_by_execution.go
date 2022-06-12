package executionService

import "github.com/dotenx/dotenx/ao-api/models"

func (manager *executionManager) GetTaskByExecution(executionId, taskId int) (models.TaskDetails, error) {
	return manager.Store.GetTaskByExecution(noContext, executionId, taskId)
}
