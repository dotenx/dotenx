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
	return models.AvaliableTasks, nil
}

func (r *predifinedTaskService) GetTaskFields(taskName string) ([]models.TaskField, error) {
	for _, taskType := range models.AvaliableTasks {
		if taskType == taskName {
			return models.TaskToFields[taskName], nil
		}
	}
	return nil, errors.New("invalid task type")
}
