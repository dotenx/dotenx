package integrationService

import (
	"errors"

	"github.com/utopiops/automated-ops/ao-api/models"
)

type IntegrationService interface {
	GetIntegrationFields(name string) ([]models.IntegrationField, error)
	GetIntegrations() ([]string, error)
	AddIntegration() error
}

type IntegrationManager struct {
	//Store pipelineStore.PipelineStore
}

func NewIntegrationService() IntegrationService {
	return &IntegrationManager{}
}

func (manager *IntegrationManager) GetIntegrationFields(name string) ([]models.IntegrationField, error) {
	fields := make([]models.IntegrationField, 0)
	for _, integ := range models.AvaliableIntegrations {
		if integ.Type == name {
			if integ.NeedsAccessToken {
				fields = append(fields, models.IntegrationField{Type: "text", Key: "access_token"})
			}
			if integ.NeedsKey {
				fields = append(fields, models.IntegrationField{Type: "text", Key: "key"})
			}
			if integ.NeedsSecret {
				fields = append(fields, models.IntegrationField{Type: "text", Key: "secret"})
			}
			if integ.NeedsUrl {
				fields = append(fields, models.IntegrationField{Type: "text", Key: "url"})
			}
			return fields, nil
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

func (manager *IntegrationManager) AddIntegration() error {
	return nil
}
