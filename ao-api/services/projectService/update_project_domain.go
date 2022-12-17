package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *projectService) UpsertProjectDomain(projectDomain models.ProjectDomain) error {
	return ps.Store.UpsertProjectDomain(context.Background(), projectDomain)
}
