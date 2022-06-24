package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *projectService) ListProjects(accountId string) ([]models.Project, error) {
	noContext := context.Background()

	return ps.Store.ListProjects(noContext, accountId)
}
