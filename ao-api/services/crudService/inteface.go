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
	GetAllExecutions(accountId string, name, projectName string) ([]models.Execution, error)
	CreatePipeLine(base *models.Pipeline, pipeline *models.PipelineVersion, isTemplate bool, isInteraction bool, projectName string) error
	CreateFromTemplate(base *models.Pipeline, pipeline *models.PipelineVersion, fields map[string]interface{}, tpAccountId, projectName string, parentId int) (string, error)
	GetTemplateDetailes(accountId string, name, projectName string) (detailes map[string]interface{}, err error)
	GetInteractionDetailes(accountId string, name, projectName string) (detailes map[string]interface{}, err error)
	UpdatePipeline(base *models.Pipeline, pipeline *models.PipelineVersion) error
	GetPipelines(accountId string) ([]models.Pipeline, error)
	GetTemplateChildren(accountId, projectName, name string) ([]models.Pipeline, error)
	ListProjectPipelines(accountId, projectName string) ([]models.Pipeline, error)
	GetPipelineByName(accountId string, name, projectName string) (models.PipelineSummery, error)
	DeletePipeline(accountId, name, projectName string, deleteRecord bool) (err error)
	ActivatePipeline(accountId, pipelineId string) (err error)
	DeActivatePipeline(accountId, pipelineId string, deleteRecord bool) (err error)
	GetActivePipelines(accountId, projectName string) ([]models.Pipeline, error)
	CheckAccess(accId string, excutionId int) (bool, error)
	NotifyPlanmanageForActivation(accId, action string, pipelineId string, deleteRecord bool) error
	SetInteractionAccess(pipelineId string, isPublic bool) (err error)
	SetUserGroups(pipelineId string, userGroups []string) (err error)
	// Deletes all the pipelines in a project
	DeleteAllPipelines(accountId, projectName string) (err error)
}

type crudManager struct {
	Store              pipelineStore.PipelineStore
	TriggerService     triggerService.TriggerService
	IntegrationService integrationService.IntegrationService
}

var noContext = context.Background()
