package predifinedTaskService

import (
	"errors"

	"github.com/utopiops/automated-ops/ao-api/models"
)

type PredifinedTaskService interface {
	GetTasks() ([]string, error)
	GetTaskFields(taskName string) ([]models.TaskField, error)
}

type predifinedTaskService struct {
	//	store runnerstore.RunnerStore
}

func NewPredefinedTaskService() PredifinedTaskService {
	return &predifinedTaskService{}
}

func (r *predifinedTaskService) GetTasks() ([]string, error) {
	types := make([]string, 0)
	for t, _ := range models.AvaliableTasks {
		types = append(types, t)
	}
	return types, nil
}

func (r *predifinedTaskService) GetTaskFields(taskType string) ([]models.TaskField, error) {
	for t := range models.AvaliableTasks {
		if t == taskType {
			return models.AvaliableTasks[t].Fields, nil
		}
	}
	return nil, errors.New("invalid task type")
}
