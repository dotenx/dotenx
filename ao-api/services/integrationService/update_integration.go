package integrationService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (manager *IntegrationManager) UpdateIntegration(accountId, integrationName string, integration models.Integration) error {
	for key, value := range integration.Secrets {
		encryptedValue, err := utils.Encrypt(value, config.Configs.Secrets.Encryption)
		if err != nil {
			return err
		}
		integration.Secrets[key] = encryptedValue
	}
	oldIntegration, err := manager.GetIntegrationByName(accountId, integrationName)
	if err != nil {
		return err
	}
	oldIntegration.Secrets = integration.Secrets
	return manager.Store.UpdateIntegration(context.Background(), accountId, integrationName, oldIntegration)
}
