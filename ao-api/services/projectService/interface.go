package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
)

func NewProjectService(store projectStore.ProjectStore) ProjectService {
	return &projectService{Store: store}
}

type ProjectService interface {
	AddProject(accountId string, project models.Project) error
	ListProjects(accountId string) ([]models.Project, error)
}

type projectService struct {
	Store projectStore.ProjectStore
}

var noContext = context.Background()
