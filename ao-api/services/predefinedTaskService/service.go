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
	GetTasks() (map[string][]taskDetail, error)
	GetTaskFields(taskName string) ([]models.TaskField, []string, []models.TaskField, error)
}

type predifinedTaskService struct {
	//	store runnerstore.RunnerStore
}

func NewPredefinedTaskService() PredifinedTaskService {
	return &predifinedTaskService{}
}

func (r *predifinedTaskService) GetTasks() (map[string][]taskDetail, error) {
	types := make(map[string][]taskDetail, 0)
	for _, t := range models.AvaliableTasks {
		if _, ok := types[t.Service]; ok {
			types[t.Service] = append(types[t.Service], taskDetail{Type: t.Type, IconUrl: t.Icon, Description: t.Description})
		} else {
			detailes := make([]taskDetail, 0)
			detailes = append(detailes, taskDetail{Type: t.Type, IconUrl: t.Icon, Description: t.Description})
			types[t.Service] = detailes
		}
	}
	return types, nil
}

func (r *predifinedTaskService) GetTaskFields(taskType string) ([]models.TaskField, []string, []models.TaskField, error) {
	for t := range models.AvaliableTasks {
		if t == taskType {
			return models.AvaliableTasks[t].Fields, models.AvaliableTasks[t].Integrations, models.AvaliableTasks[t].Outputs, nil
		}
	}
	return nil, nil, nil, errors.New("invalid task type")
}
