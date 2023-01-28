package executionService

import (
	"github.com/dotenx/dotenx/ao-api/models"
)

func (manager *executionManager) IsExecutionDone(totalTasks int, currentTasks []models.TaskStatusSummery) bool {
	doneTasks := 0
	for _, task := range currentTasks {
		if task.Status == "completed" || task.Status == "failed" {
			doneTasks++
		}
	}
	return doneTasks == totalTasks
}

func (manager *executionManager) IsChanged(inputSummeries, lastSummeries []models.TaskStatusSummery) bool {
	for _, inTask := range inputSummeries {
		for _, oldTask := range lastSummeries {
			if inTask.Name == oldTask.Name {
				if inTask.Status != oldTask.Status {
					return true
				}
			}
		}
	}
	return false
}
