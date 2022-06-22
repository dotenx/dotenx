package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *projectService) GetProject(accountId string, projectName string) (models.Project, error) {
	noContext := context.Background()

	return ps.Store.GetProject(noContext, accountId, projectName)
}
