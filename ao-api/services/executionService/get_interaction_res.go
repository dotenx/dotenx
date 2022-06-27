package executionService

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
)

type Status struct {
	summeries []models.TaskStatusSummery
	lastTask  int
}

func (manager *executionManager) getResponse(executionId int) (interface{}, error) {
	totalTasks, err := manager.GetNumberOfTasksByExecution(executionId)
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}
	status := Status{summeries: []models.TaskStatusSummery{}}
	for {
		if manager.IsExecutionDone(totalTasks, status.summeries) {
			return manager.Store.GetTaskResultDetails(noContext, executionId, status.lastTask)
		}
		tasks, err := manager.GetTasksWithStatusForExecution(executionId)
		if err != nil {
			fmt.Println(err.Error())
			return nil, err
		}
		if len(tasks) > len(status.summeries) {
			newTask, err := findNewAddedTask(status.summeries, tasks)
			if err != nil {
				return nil, err
			}
			status.lastTask = newTask
			status.summeries = tasks
		} else if manager.IsChanged(tasks, status.summeries) {
			status.summeries = tasks
		}
		time.Sleep(10 * time.Millisecond)
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

func findNewAddedTask(oldTasks, newTasks []models.TaskStatusSummery) (int, error) {
	for _, t := range newTasks {
		var exists bool
		for _, ot := range oldTasks {
			if t.Id == ot.Id {
				exists = true
				break
			}
		}
		if !exists {
			return t.Id, nil
		}
	}
	return 0, errors.New("no new task found")
}
