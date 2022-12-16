package predifinedTaskService

import (
	"errors"
	"strings"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
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
	MarketplaceService marketplaceService.MarketplaceService
}

func NewPredefinedTaskService(mService marketplaceService.MarketplaceService) PredifinedTaskService {
	return &predifinedTaskService{
		MarketplaceService: mService,
	}
}

func (r *predifinedTaskService) GetTasks() (map[string][]taskDetail, error) {
	types := make(map[string][]taskDetail, 0)
	for _, t := range models.AvaliableTasks {
		if t.OnTestStage {
			continue
		}
		lambdaName := strings.ReplaceAll(t.Image, ":", "-")
		lambdaName = strings.ReplaceAll(lambdaName, "/", "-")
		function, err := r.MarketplaceService.GetFunction(lambdaName)
		if err != nil && err.Error() != "function not found" {
			continue
		}
		if err == nil {
			if !function.Enabled {
				continue
			}
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
