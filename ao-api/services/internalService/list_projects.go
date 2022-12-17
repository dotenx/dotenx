package internalService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *internalService) ListProjects(accountId string) ([]models.Project, error) {
	noContext := context.Background()

	return ps.ProjectStore.ListProjects(noContext, accountId)
}
