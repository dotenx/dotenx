package integrationService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (manager *IntegrationManager) GetAllIntegrationsForAccountByType(accountId, projectName string, integrationTypes []string) ([]models.Integration, error) {
	integrations := make([]models.Integration, 0)
	var err error
	for _, intgType := range integrationTypes {
		intgs, err := manager.Store.GetIntegrationsByType(context.Background(), accountId, intgType, projectName)
		if err == nil {
			integrations = append(integrations, intgs...)
		}
	}
	return integrations, err
}
