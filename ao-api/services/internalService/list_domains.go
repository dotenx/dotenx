package internalService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

// ListDomains returns list of external domains for a specific user
func (ps *internalService) ListDomains(accountId string) ([]models.ProjectDomain, error) {
	noContext := context.Background()
	return ps.ProjectStore.ListProjectExternalDomains(noContext, accountId)
}
