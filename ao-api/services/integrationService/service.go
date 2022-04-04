package integrationService

import (
	"context"
	"errors"

	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/integrationStore"
)

type IntegrationService interface {
	GetIntegrationFields(name string) ([]string, error)
	GetIntegrationByName(accountId, name string) (models.Integration, error)
	DeleteIntegration(accountId string, integrationName string) error
	GetIntegrationTypes() ([]string, error)
	GetAllIntegrations(accountId string) ([]models.Integration, error)
	GetAllIntegrationsForAccountByType(accountId string, integrationTypes []string) ([]models.Integration, error)
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
	return manager.Store.GetIntegrationByName(context.Background(), accountId, name)
}
