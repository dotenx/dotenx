package predifinedTaskService

import (
	"errors"

	"github.com/utopiops/automated-ops/ao-api/models"
)

type taskDetail struct {
	Type        string `json:"type"`
	IconUrl     string `json:"icon_url"`
	Description string `json:"description"`
}

type PredifinedTaskService interface {
	GetTasks() ([]taskDetail, error)
	GetTaskFields(taskName string) ([]models.TaskField, string, error)
}

type predifinedTaskService struct {
	//	store runnerstore.RunnerStore
}

func NewPredefinedTaskService() PredifinedTaskService {
	return &predifinedTaskService{}
}

func (r *predifinedTaskService) GetTasks() ([]taskDetail, error) {
	types := make([]taskDetail, 0)
	for _, t := range models.AvaliableTasks {
		types = append(types, taskDetail{Type: t.Type, IconUrl: t.Icon, Description: t.Description})
	}
	return types, nil
}

func (r *predifinedTaskService) GetTaskFields(taskType string) ([]models.TaskField, string, error) {
	for t := range models.AvaliableTasks {
		if t == taskType {
			return models.AvaliableTasks[t].Fields, models.AvaliableTasks[t].Integration, nil
		}
	}
	return nil, "", errors.New("invalid task type")
}
