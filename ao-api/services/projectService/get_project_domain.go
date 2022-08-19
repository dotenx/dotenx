package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *projectService) GetProjectDomain(accountId, projectTag string) (models.ProjectDomain, error) {
	return ps.Store.GetProjectDomain(context.Background(), accountId, projectTag)
}
