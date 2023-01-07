package gitIntegrationService

import (
	"github.com/dotenx/dotenx/ao-api/models"
)

func (service *gitIntegrationService) UpsertIntegration(integration models.GitIntegration) error {
	return service.Store.UpsertIntegration(noContext, integration)
}
