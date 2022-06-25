package crudService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	triggerService "github.com/dotenx/dotenx/ao-api/services/triggersService"
	"github.com/dotenx/dotenx/ao-api/stores/pipelineStore"
)

func NewCrudService(store pipelineStore.PipelineStore, trService triggerService.TriggerService, integrationService integrationService.IntegrationService) CrudService {
	return &crudManager{Store: store, TriggerService: trService, IntegrationService: integrationService}
}

type CrudService interface {
	GetAllExecutions(accountId string, name string) ([]models.Execution, error)
	CreatePipeLine(base *models.Pipeline, pipeline *models.PipelineVersion, isTemplate bool, isInteraction bool) error
	CreateFromTemplate(base *models.Pipeline, pipeline *models.PipelineVersion, fields map[string]interface{}) (string, error)
	UpdatePipeline(base *models.Pipeline, pipeline *models.PipelineVersion) error
	GetPipelines(accountId string) ([]models.Pipeline, error)
	GetPipelineByName(accountId string, name string) (models.PipelineVersion, string, bool, bool, bool, error)
	DeletePipeline(accountId, name string, deleteRecord bool) (err error)
	ActivatePipeline(accountId, pipelineId string) (err error)
	DeActivatePipeline(accountId, pipelineId string, deleteRecord bool) (err error)
	GetActivePipelines(accountId string) ([]models.Pipeline, error)
	CheckAccess(accId string, excutionId int) (bool, error)
	NotifyPlanmanageForActivation(accId, action string, pipelineId string, deleteRecord bool) error
}

type crudManager struct {
	Store              pipelineStore.PipelineStore
	TriggerService     triggerService.TriggerService
	IntegrationService integrationService.IntegrationService
}

var noContext = context.Background()
