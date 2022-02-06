package executionService

import "github.com/utopiops/automated-ops/ao-api/models"

func (manager *executionManager) GetTaskByExecution(executionId, taskId int) (models.TaskDetails, error) {
	return manager.Store.GetTaskByExecution(noContext, executionId, taskId)
}
