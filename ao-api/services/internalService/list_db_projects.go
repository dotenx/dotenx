package internalService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

// ListDBProjects returns projects that have database
func (ps *internalService) ListDBProjects(accountId string) ([]models.Project, error) {
	noContext := context.Background()

	return ps.ProjectStore.ListDBProjects(noContext, accountId)
}
