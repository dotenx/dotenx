package internalService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

// ListDomains returns list of external domains for a specific user based on project type
func (ps *internalService) ListDomains(accountId, projectType string) ([]models.ProjectDomain, error) {
	noContext := context.Background()
	domains, err := ps.ProjectStore.ListProjectExternalDomains(noContext, accountId)
	if err != nil {
		return nil, err
	}
	filteredDomains := make([]models.ProjectDomain, 0)
	// TODO: we should filter domains by project type in store (db query)
	for _, d := range domains {
		project, err := ps.ProjectStore.GetProjectByTag(noContext, d.ProjectTag)
		if err != nil {
			return nil, err
		}
		if project.Type == projectType {
			filteredDomains = append(filteredDomains, d)
		}
	}
	return filteredDomains, nil
}
