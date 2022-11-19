package internalService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
)

func NewInternalService(projStore projectStore.ProjectStore, databaseStore databaseStore.DatabaseStore, redisStore redisStore.RedisStore, pipelineService crudService.CrudService, ubService uibuilderService.UIbuilderService) InternalService {
	return &internalService{
		ProjectStore:     projStore,
		DatabaseStore:    databaseStore,
		RedisStore:       redisStore,
		PipelineService:  pipelineService,
		UIbuilderService: ubService,
	}
}

type InternalService interface {
	ListProjects(accountId string) ([]models.Project, error)
	ListDBProjects(accountId string) ([]models.Project, error)
	ListTpUsers(projects []models.Project, accountId string) ([]models.ThirdUser, error)
	ListUiPages(accountId string) ([]string, error)
	ProcessUpdatingPlan(accountId string) (err error)
}

type internalService struct {
	ProjectStore     projectStore.ProjectStore
	DatabaseStore    databaseStore.DatabaseStore
	RedisStore       redisStore.RedisStore
	PipelineService  crudService.CrudService
	UIbuilderService uibuilderService.UIbuilderService
}

var noContext = context.Background()
