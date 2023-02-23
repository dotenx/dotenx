package internalService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *internalService) ListProjects(accountId, projectType string) ([]models.Project, error) {
	noContext := context.Background()

	projects, err := ps.ProjectStore.ListProjects(noContext, accountId)
	if err != nil {
		return nil, err
	}
	filteredProjects := make([]models.Project, 0)
	for _, p := range projects {
		if p.Type == projectType {
			filteredProjects = append(filteredProjects, p)
		}
	}
	return filteredProjects, nil
}
