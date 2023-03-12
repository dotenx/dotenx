package integrationService

import (
	"errors"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (manager *IntegrationManager) GetIntegrationFields(name string) (models.IntegrationDefinition, error) {
	for _, integ := range models.AvaliableIntegrations {
		if integ.Type == name {
			return integ, nil
		}
	}
	return models.IntegrationDefinition{}, errors.New("no integration with this name")
}
