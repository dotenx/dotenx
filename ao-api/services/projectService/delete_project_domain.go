package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *projectService) DeleteProjectDomain(projectDomain models.ProjectDomain) error {
	return ps.Store.DeleteProjectDomain(context.Background(), projectDomain)
}
