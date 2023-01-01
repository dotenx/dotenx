package gitIntegrationService

import "github.com/dotenx/dotenx/ao-api/models"

func (service *gitIntegrationService) ListIntegrations(accountId, provider string) ([]models.GitIntegration, error) {
	return service.Store.ListIntegrations(noContext, accountId, provider)
}
