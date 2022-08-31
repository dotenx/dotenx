package internalService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
)

func NewInternalService(projStore projectStore.ProjectStore, databaseStore databaseStore.DatabaseStore) InternalService {
	return &internalService{
		ProjectStore:  projStore,
		DatabaseStore: databaseStore,
	}
}

type InternalService interface {
	ListProjects(accountId string) ([]models.Project, error)
	ListDBProjects(accountId string) ([]models.Project, error)
	ListTpUsers(projects []models.Project, accountId string) ([]models.ThirdUser, error)
}

type internalService struct {
	ProjectStore  projectStore.ProjectStore
	DatabaseStore databaseStore.DatabaseStore
}

var noContext = context.Background()
