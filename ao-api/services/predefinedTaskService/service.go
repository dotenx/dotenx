package predifinedTaskService

import (
	"errors"

	"github.com/dotenx/dotenx/ao-api/models"
)

type taskDetail struct {
	Type        string `json:"type"`
	IconUrl     string `json:"icon_url"`
	NodeColor   string `json:"node_color"`
	Description string `json:"description"`
}

type PredifinedTaskService interface {
	GetTasks() (map[string][]taskDetail, error)
	GetTaskFields(taskName string) ([]models.TaskField, []string, []models.TaskField, bool, error)
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
		if t.OnTestStage {
			continue
		}
		if _, ok := types[t.Service]; ok {
			types[t.Service] = append(types[t.Service], taskDetail{Type: t.Type, IconUrl: t.Icon, Description: t.Description})
		} else {
			detailes := make([]taskDetail, 0)
			detailes = append(detailes, taskDetail{Type: t.Type, IconUrl: t.Icon, Description: t.Description, NodeColor: t.NodeColor})
			types[t.Service] = detailes
		}
	}
	return types, nil
}

func (r *predifinedTaskService) GetTaskFields(taskType string) ([]models.TaskField, []string, []models.TaskField, bool, error) {
	for t := range models.AvaliableTasks {
		if t == taskType {
			return models.AvaliableTasks[t].Fields, models.AvaliableTasks[t].Integrations, models.AvaliableTasks[t].Outputs, models.AvaliableTasks[t].HasDynamicVariables, nil
		}
	}
	return nil, nil, nil, false, errors.New("invalid task type")
}
