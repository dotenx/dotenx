package integrationService

import (
	"context"
	"errors"

	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/integrationStore"
)

type IntegrationService interface {
	GetIntegrationFields(name string) ([]string, error)
	DeleteIntegration(accountId string, integrationName string) error
	GetIntegrationTypes() ([]string, error)
	GetAllIntegrations(accountId string) ([]models.Integration, error)
	GetAllIntegrationsForAccountByType(accountId, integrationType string) ([]models.Integration, error)
	AddIntegration(accountId string, integration models.Integration) error
}

type IntegrationManager struct {
	Store integrationStore.IntegrationStore
}

func NewIntegrationService(store integrationStore.IntegrationStore) IntegrationService {
	return &IntegrationManager{Store: store}
}

func (manager *IntegrationManager) GetIntegrationFields(name string) ([]string, error) {
	for _, integ := range models.AvaliableIntegrations {
		if integ.Type == name {
			return integ.Fields, nil
		}
	}
	return nil, errors.New("no integration with this name")
}
func (manager *IntegrationManager) GetIntegrationTypes() ([]string, error) {
	integrations := make([]string, 0)
	for _, integ := range models.AvaliableIntegrations {
		integrations = append(integrations, integ.Type)
	}
	return integrations, nil
}

func (manager *IntegrationManager) AddIntegration(accountId string, integration models.Integration) error {
	return manager.Store.AddIntegration(context.Background(), accountId, integration)
}
func (manager *IntegrationManager) DeleteIntegration(accountId string, integrationName string) error {
	return manager.Store.DeleteIntegration(context.Background(), accountId, integrationName)
}
func (manager *IntegrationManager) GetAllIntegrations(accountId string) ([]models.Integration, error) {
	return manager.Store.GetAllintegrations(context.Background(), accountId)
}
func (manager *IntegrationManager) GetAllIntegrationsForAccountByType(accountId, integrationType string) ([]models.Integration, error) {
	return manager.Store.GetIntegrationsByType(context.Background(), accountId, integrationType)
}
