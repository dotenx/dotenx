package integrationService

import (
	"errors"

	"github.com/utopiops/automated-ops/ao-api/models"
)

type IntegrationService interface {
	GetIntegrationFields(name string) ([]models.IntegrationField, error)
	GetIntegrations() ([]string, error)
	AddIntegration(accountId string, integration models.IntegrationDefinition) error
}

type IntegrationManager struct {
	//Store pipelineStore.PipelineStore
}

func NewIntegrationService() IntegrationService {
	return &IntegrationManager{}
}

func (manager *IntegrationManager) GetIntegrationFields(name string) ([]models.IntegrationField, error) {
	for _, integ := range models.AvaliableIntegrations {
		if integ.Type == name {
			return integ.Fields, nil
		}
	}
	return nil, errors.New("no integration with this name")
}
func (manager *IntegrationManager) GetIntegrations() ([]string, error) {
	integrations := make([]string, 0)
	for _, integ := range models.AvaliableIntegrations {
		integrations = append(integrations, integ.Type)
	}
	return integrations, nil
}

func (manager *IntegrationManager) AddIntegration(accountId string, integration models.IntegrationDefinition) error {
	return nil
}
