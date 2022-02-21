package integrationService

import (
	"errors"

	"github.com/utopiops/automated-ops/ao-api/models"
)

type IntegrationService interface {
	GetIntegrationFields(name string) ([]field, error)
	GetIntegrations() ([]string, error)
	AddIntegration() error
}

type IntegrationManager struct {
	//Store pipelineStore.PipelineStore
}

func NewIntegrationService() IntegrationService {
	return &IntegrationManager{}
}

type field struct {
	Key  string `json:"key"`
	Type string `json:"type"`
}

func (manager *IntegrationManager) GetIntegrationFields(name string) ([]field, error) {
	fields := make([]field, 0)
	for _, integ := range models.AvaliableIntegrations {
		if integ.Type == name {
			if integ.NeedsAccessToken {
				fields = append(fields, field{Type: "text", Key: "access_token"})
			}
			if integ.NeedsKey {
				fields = append(fields, field{Type: "text", Key: "key"})
			}
			if integ.NeedsSecret {
				fields = append(fields, field{Type: "text", Key: "secret"})
			}
			if integ.NeedsUrl {
				fields = append(fields, field{Type: "text", Key: "url"})
			}
			return fields, nil
		}
	}
	return nil, errors.New("no integration with this name")
}
func (manager *IntegrationManager) GetIntegrations() ([]string, error) {
	return nil, nil
}

func (manager *IntegrationManager) AddIntegration() error {
	return nil
}
