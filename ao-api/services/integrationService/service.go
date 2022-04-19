package integrationService

import (
	"context"
	"errors"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
)

type IntegrationService interface {
	GetIntegrationFields(name string) (models.IntegrationDefinition, error)
	GetIntegrationByName(accountId, name string) (models.Integration, error)
	DeleteIntegration(accountId string, integrationName string) error
	GetIntegrationTypes() ([]string, error)
	GetAllIntegrations(accountId string) ([]models.Integration, error)
	GetAllIntegrationsForAccountByType(accountId string, integrationTypes []string) ([]models.Integration, error)
	AddIntegration(accountId string, integration models.Integration) error
	SetRedisPair(key, value string, ttl time.Duration) (err error)
}

type IntegrationManager struct {
	Store      integrationStore.IntegrationStore
	RedisStore redisStore.RedisStore
}

func NewIntegrationService(store integrationStore.IntegrationStore, redisStore redisStore.RedisStore) IntegrationService {
	return &IntegrationManager{
		Store:      store,
		RedisStore: redisStore,
	}
}

func (manager *IntegrationManager) GetIntegrationFields(name string) (models.IntegrationDefinition, error) {
	for _, integ := range models.AvaliableIntegrations {
		if integ.Type == name {
			return integ, nil
		}
	}
	return models.IntegrationDefinition{}, errors.New("no integration with this name")
}
func (manager *IntegrationManager) GetIntegrationTypes() ([]string, error) {
	integrations := make([]string, 0)
	for _, integ := range models.AvaliableIntegrations {
		integrations = append(integrations, integ.Type)
	}
	return integrations, nil
}

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
func (manager *IntegrationManager) DeleteIntegration(accountId string, integrationName string) (err error) {
	checkTasks, _ := manager.Store.CheckTasksForIntegration(context.Background(), accountId, integrationName)
	if checkTasks {
		return errors.New("your integration is used for a task")
	}
	checkTriggers, _ := manager.Store.CheckTriggersForIntegration(context.Background(), accountId, integrationName)
	if checkTriggers {
		return errors.New("your integration is used for a trigger")
	}
	return manager.Store.DeleteIntegration(context.Background(), accountId, integrationName)
}

func (manager *IntegrationManager) GetAllIntegrations(accountId string) ([]models.Integration, error) {
	return manager.Store.GetAllintegrations(context.Background(), accountId)
}
func (manager *IntegrationManager) GetAllIntegrationsForAccountByType(accountId string, integrationTypes []string) ([]models.Integration, error) {
	integrations := make([]models.Integration, 0)
	var err error
	for _, intgType := range integrationTypes {
		intgs, err := manager.Store.GetIntegrationsByType(context.Background(), accountId, intgType)
		if err == nil {
			integrations = append(integrations, intgs...)
		}
	}
	return integrations, err
}

func (manager *IntegrationManager) GetIntegrationByName(accountId, name string) (models.Integration, error) {

	integration, err := manager.Store.GetIntegrationByName(context.Background(), accountId, name)
	if err != nil {
		return models.Integration{}, err
	}
	if !integration.HasRefreshToken {
		for key, value := range integration.Secrets {
			decrypted, err := utils.Decrypt(value, config.Configs.Secrets.Encryption)
			if err != nil {
				return models.Integration{}, err
			}
			integration.Secrets[key] = decrypted
		}
		return integration, err
	} else {
		providerName := models.AvaliableIntegrations[integration.Type].OauthProvider
		provider, err := oauth.GetProviderByName(providerName)
		if err != nil {
			return models.Integration{}, err
		}
		accessToken, refreshToken, err := oauth.ExchangeRefreshToken(*provider, integration.Name, accountId, manager.RedisStore)
		if err != nil {
			return models.Integration{}, err
		}
		return models.Integration{
			Name:      integration.Name,
			AccountId: accountId,
			Type:      integration.Type,
			Secrets: map[string]string{
				"ACCESS_TOKEN":  accessToken,
				"REFRESH_TOKEN": refreshToken,
			},
			HasRefreshToken: integration.HasRefreshToken,
		}, nil
	}
}

func (manager *IntegrationManager) SetRedisPair(key, value string, ttl time.Duration) (err error) {
	return manager.RedisStore.SetRedisPair(key, value, ttl)
}
