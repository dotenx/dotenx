package internalService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/uiFormService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
)

func NewInternalService(projStore projectStore.ProjectStore, databaseStore databaseStore.DatabaseStore, redisStore redisStore.RedisStore, pipelineService crudService.CrudService, ubService uibuilderService.UIbuilderService, ufService uiFormService.UIFormService) InternalService {
	return &internalService{
		ProjectStore:     projStore,
		DatabaseStore:    databaseStore,
		RedisStore:       redisStore,
		PipelineService:  pipelineService,
		UIbuilderService: ubService,
		UIFormService:    ufService,
	}
}

type InternalService interface {
	ListProjects(accountId, projectType string) ([]models.Project, error)
	ListDBProjects(accountId string) ([]models.Project, error)
	ListTpUsers(projects []models.Project, accountId string) ([]models.ThirdUser, error)
	ListDomains(accountId, projectType string) ([]models.ProjectDomain, error)
	ListUiPages(accountId string) ([]string, error)
	ProcessUpdatingPlan(accountId string) (err error)
	GetNumberOfUiFormResponse(accountId, projectType, from, to string) (int64, error)
}

type internalService struct {
	ProjectStore     projectStore.ProjectStore
	DatabaseStore    databaseStore.DatabaseStore
	RedisStore       redisStore.RedisStore
	PipelineService  crudService.CrudService
	UIbuilderService uibuilderService.UIbuilderService
	UIFormService    uiFormService.UIFormService
}

var noContext = context.Background()
