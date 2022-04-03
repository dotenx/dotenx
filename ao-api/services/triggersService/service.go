package triggerService

import (
	"context"
	"errors"

	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/services/utopiopsService"
	"github.com/utopiops/automated-ops/ao-api/stores/integrationStore"
	"github.com/utopiops/automated-ops/ao-api/stores/triggerStore"
)

type TriggerService interface {
	GetTriggerTypes() (map[string][]string, error)
	GetAllTriggers(accountId string) ([]models.EventTrigger, error)
	GetAllTriggersForAccountByType(accountId, triggerType string) ([]models.EventTrigger, error)
	GetDefinitionForTrigger(accountId, triggerType string) (models.TriggerDefinition, error)
	AddTrigger(accountId string, trigger models.EventTrigger) error
	DeleteTrigger(accountId string, triggerName string) error
	StartChecking(accId string, store integrationStore.IntegrationStore) error
}

type TriggerManager struct {
	Store           triggerStore.TriggerStore
	UtopiopsService utopiopsService.UtopiopsService
}

func NewTriggerService(store triggerStore.TriggerStore, service utopiopsService.UtopiopsService) TriggerService {
	return &TriggerManager{Store: store, UtopiopsService: service}
}

func (manager *TriggerManager) GetTriggerTypes() (map[string][]string, error) {
	triggers := make(map[string][]string)
	for _, integ := range models.AvaliableTriggers {
		if _, ok := triggers[integ.Service]; ok {
			triggers[integ.Service] = append(triggers[integ.Service], integ.Type)
		} else {
			types := make([]string, 0)
			types = append(types, integ.Type)
			triggers[integ.Service] = types
		}

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
