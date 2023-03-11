package integrationService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (manager *IntegrationManager) GetAllIntegrations(accountId, projectName string) ([]models.Integration, error) {
	selected := make([]models.Integration, 0)
	integrations, err := manager.Store.GetAllintegrations(context.Background(), accountId, projectName)
	if err != nil {
		return nil, err
	}
	for _, integ := range integrations {
		if integ.TpAccountId == "" {
			selected = append(selected, integ)
		}
	}
	return selected, nil
}
