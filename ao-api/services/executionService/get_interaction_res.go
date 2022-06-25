package executionService

import (
	"fmt"
	"log"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (manager *executionManager) getResponse(executionId int) (interface{}, error) {
	totalTasks, err := manager.GetNumberOfTasksByExecution(executionId)
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}
	var lastSummeries []models.TaskStatusSummery
	for {
		if manager.IsExecutionDone(totalTasks, lastSummeries) {
			lastTaskId := getLastTaskId(lastSummeries)
			return manager.Store.GetTaskResultDetails(noContext, executionId, lastTaskId)
		}
		tasks, err := manager.GetTasksWithStatusForExecution(executionId)
		if err != nil {
			fmt.Println(err.Error())
			return nil, err
		}
		if len(lastSummeries) > 0 && !manager.IsChanged(tasks, lastSummeries) {
			time.Sleep(600 * time.Millisecond)
			continue
		}
		lastSummeries = tasks
		time.Sleep(100 * time.Millisecond)
	}
	//	return nil, errors.New("no task for this interaction")
}

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

func getLastTaskId(summeries []models.TaskStatusSummery) int {
	last := -100
	for _, sum := range summeries {
		if sum.Id > last {
			last = sum.Id
		}
	}
	return last
}
