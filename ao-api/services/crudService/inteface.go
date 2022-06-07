package crudService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	triggerService "github.com/dotenx/dotenx/ao-api/services/triggersService"
	"github.com/dotenx/dotenx/ao-api/stores/pipelineStore"
)

func NewCrudService(store pipelineStore.PipelineStore, trService triggerService.TriggerService) CrudService {
	return &crudManager{Store: store, TriggerService: trService}
}

type CrudService interface {
	GetAllExecutions(accountId string, name string) ([]models.Execution, error)
	CreatePipeLine(base *models.Pipeline, pipeline *models.PipelineVersion, isTemplate bool) error
	CreateFromTemplate(base *models.Pipeline, pipeline *models.PipelineVersion, fields map[string]interface{}) (string, error)
	UpdatePipeline(base *models.Pipeline, pipeline *models.PipelineVersion) error
	GetPipelines(accountId string) ([]models.Pipeline, error)
	GetPipelineByName(accountId string, name string) (models.PipelineVersion, string, bool, bool, error)
	DeletePipeline(accountId, name string, deleteRecord bool) (err error)
	ActivatePipeline(accountId, pipelineId string) (err error)
	DeActivatePipeline(accountId, pipelineId string, deleteRecord bool) (err error)
	GetActivePipelines(accountId string) ([]models.Pipeline, error)
	CheckAccess(accId string, excutionId int) (bool, error)
	NotifyPlanmanageForActivation(accId, action string, pipelineId string, deleteRecord bool) error
}

type crudManager struct {
	Store          pipelineStore.PipelineStore
	TriggerService triggerService.TriggerService
}

var noContext = context.Background()
