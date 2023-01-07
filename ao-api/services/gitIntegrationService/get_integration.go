package gitIntegrationService

import (
	"github.com/dotenx/dotenx/ao-api/models"
)

func (service *gitIntegrationService) GetIntegration(accountId, gitAccountId, provider string) (models.GitIntegration, error) {
	return service.Store.GetIntegration(noContext, accountId, gitAccountId, provider)
}
