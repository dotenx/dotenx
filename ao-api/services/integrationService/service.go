package integrationService

import (
	"context"
	"errors"

	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/integrationStore"
)

type IntegrationService interface {
	GetIntegrationFields(name string) ([]string, error)
	GetIntegrationTypes() ([]string, error)
	AddIntegration(accountId string, integration models.Integration) error
}

type IntegrationManager struct {
	Store integrationStore.IntegrationStore
}

func NewIntegrationService() IntegrationService {
	return &IntegrationManager{}
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
	// todo: make ready the body to be saved in table
	return manager.Store.AddIntegration(context.Background(), accountId, integration)
}
