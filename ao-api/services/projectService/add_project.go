package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *projectService) AddProject(accountId string, project models.Project) error {
	noContext := context.Background()
	return ps.Store.AddProject(noContext, accountId, project)
}
