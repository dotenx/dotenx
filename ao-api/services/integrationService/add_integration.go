package integrationService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (manager *IntegrationManager) AddIntegration(accountId string, integration models.Integration) error {
	for key, value := range integration.Secrets {
		encryptedValue, err := utils.Encrypt(value, config.Configs.Secrets.Encryption)
		if err != nil {
			return err
		}
		integration.Secrets[key] = encryptedValue
	}
	return manager.Store.AddIntegration(context.Background(), accountId, integration)
}
