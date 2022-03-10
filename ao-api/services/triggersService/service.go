package triggerService

import (
	"context"
	"errors"

	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/integrationStore"
	"github.com/utopiops/automated-ops/ao-api/stores/triggerStore"
)

type TriggerService interface {
	GetTriggerTypes() ([]string, error)
	GetAllTriggers(accountId string) ([]models.EventTrigger, error)
	GetAllTriggersForAccountByType(accountId, triggerType string) ([]models.EventTrigger, error)
	GetDefinitionForTrigger(accountId, triggerType string) (models.TriggerDefinition, error)
	AddTrigger(accountId string, trigger models.EventTrigger) error
	DeleteTrigger(accountId string, triggerName string) error
	StartChecking(accId string, store integrationStore.IntegrationStore) error
}

type TriggerManager struct {
	Store triggerStore.TriggerStore
}

func NewTriggerService(store triggerStore.TriggerStore) TriggerService {
	return &TriggerManager{Store: store}
}

func (manager *TriggerManager) GetTriggerTypes() ([]string, error) {
	triggers := make([]string, 0)
	for _, integ := range models.AvaliableTriggers {
		triggers = append(triggers, integ.Type)
	}
	return triggers, nil
}

func (manager *TriggerManager) AddTrigger(accountId string, trigger models.EventTrigger) error {
	// todo: make ready the body to be saved in table
	return manager.Store.AddTrigger(context.Background(), accountId, trigger)
}
func (manager *TriggerManager) DeleteTrigger(accountId string, triggerName string) error {
	return manager.Store.DeleteTrigger(context.Background(), accountId, triggerName)
}
func (manager *TriggerManager) GetAllTriggers(accountId string) ([]models.EventTrigger, error) {
	return manager.Store.GetAllTriggers(context.Background(), accountId)
}
func (manager *TriggerManager) GetAllTriggersForAccountByType(accountId, triggerType string) ([]models.EventTrigger, error) {
	return manager.Store.GetTriggersByType(context.Background(), accountId, triggerType)
}

func (manager *TriggerManager) GetDefinitionForTrigger(accountId, triggerType string) (models.TriggerDefinition, error) {
	intgType, ok := models.AvaliableTriggers[triggerType]
	if ok {
		return intgType, nil
	}
	return models.TriggerDefinition{}, errors.New("invalid trigger type")
}
