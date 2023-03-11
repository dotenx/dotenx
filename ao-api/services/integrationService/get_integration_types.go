package integrationService

import "github.com/dotenx/dotenx/ao-api/models"

func (manager *IntegrationManager) GetIntegrationTypes() ([]models.IntegrationDefinition, error) {
	integrations := make([]models.IntegrationDefinition, 0)
	for _, integ := range models.AvaliableIntegrations {
		integrations = append(integrations, integ)
	}
	return integrations, nil
}
