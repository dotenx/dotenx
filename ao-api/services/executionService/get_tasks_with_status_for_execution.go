package executionService

import "github.com/utopiops/automated-ops/ao-api/models"

func (manager *executionManager) GetTasksWithStatusForExecution(executionId int) ([]models.TaskStatusSummery, error) {
	tasks, err := manager.Store.GetTasksWithStatusForExecution(noContext, executionId)
	if err != nil {
		return nil, err
	}
	summeries := make([]models.TaskStatusSummery, 0)
	for _, task := range tasks {
		name, err := manager.Store.GetTaskNameById(noContext, task.Id)
		if err != nil {
			return nil, err
		}
		task.name = name
		summeries = append(summeries, task)
	}
	return summeries, nil
}
