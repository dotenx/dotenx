package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *projectService) GetProjectByTag(tag string) (models.Project, error) {
	noContext := context.Background()

	return ps.Store.GetProjectByTag(noContext, tag)
}
