package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
	"github.com/dotenx/dotenx/ao-api/stores/userManagementStore"
)

func NewProjectService(store projectStore.ProjectStore, tpUserStore userManagementStore.UserManagementStore) ProjectService {
	return &projectService{Store: store, TpUserStore: tpUserStore}
}

type ProjectService interface {
	AddProject(accountId string, project models.Project) error
	ListProjects(accountId string) ([]models.Project, error)
	GetProject(accountId string, projectName string) (models.Project, error)
	GetProjectByTag(tag string) (models.Project, error)
	GetProjectDomain(accountId, projectTag string) (models.ProjectDomain, error)
	UpsertProjectDomain(projectDomain models.ProjectDomain) error
	CheckCreateProjectAccess(accountId string) (bool, error)
	CheckCreateDatabaseAccess(accountId string) (bool, error)
}

type projectService struct {
	Store       projectStore.ProjectStore
	TpUserStore userManagementStore.UserManagementStore
}

var noContext = context.Background()
