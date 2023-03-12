package integrationService

import (
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
	"github.com/dotenx/dotenx/ao-api/stores/oauthStore"
	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
)

type IntegrationService interface {
	GetIntegrationFields(name string) (models.IntegrationDefinition, error)
	GetIntegrationByName(accountId, name string) (models.Integration, error)
	GetIntegrationForThirdPartyAccount(accountId, tpAccountId, intgType string) (models.Integration, error)
	DeleteIntegration(accountId string, integrationName string) error
	GetIntegrationTypes() ([]models.IntegrationDefinition, error)
	GetAllIntegrations(accountId, projectName string) ([]models.Integration, error)
	GetAllIntegrationsForAccountByType(accountId, projectName string, integrationTypes []string) ([]models.Integration, error)
	AddIntegration(accountId string, integration models.Integration) error
	SetRedisPair(key, value string, ttl time.Duration) (err error)
	UpdateIntegration(accountId, integrationName string, integration models.Integration) error
	GetConnectedAccount(accountId, integrationName string) (map[string]interface{}, error)
}

type IntegrationManager struct {
	Store      integrationStore.IntegrationStore
	RedisStore redisStore.RedisStore
	OauthStore oauthStore.OauthStore
}

func NewIntegrationService(store integrationStore.IntegrationStore, redisStore redisStore.RedisStore, OauthStore oauthStore.OauthStore) IntegrationService {
	return &IntegrationManager{
		Store:      store,
		RedisStore: redisStore,
		OauthStore: OauthStore,
	}
}

func (manager *IntegrationManager) SetRedisPair(key, value string, ttl time.Duration) (err error) {
	return manager.RedisStore.SetRedisPair(key, value, ttl)
}
