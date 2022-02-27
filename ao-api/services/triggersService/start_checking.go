package triggerService

import (
	"context"
	"strconv"
	"time"

	"github.com/utopiops/automated-ops/ao-api/config"
	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/integrationStore"
)

func (manager *TriggerManager) StartChecking(accId string, store integrationStore.IntegrationStore) error {
	triggers, err := manager.Store.GetAllTriggers(context.Background(), accId)
	if err != nil {
		return err
	}
	freq, err := strconv.Atoi(config.Configs.App.CheckTrigger)
	if err != nil {
		return err
	}
	for _, trigger := range triggers {
		go handleTrigger(accId, trigger, store, freq)
	}
	return nil
}

func handleTrigger(accountId string, trigger models.EventTrigger, store integrationStore.IntegrationStore, freq int) {
	integration, err := store.GetIntegrationsByName(context.Background(), accountId, trigger.Integration)
	if err != nil {
		return
	}
	for start := time.Now(); time.Since(start) < time.Duration(freq)*time.Second; {
		checkTrigger(trigger, integration)
	}
}

func checkTrigger(trigger models.EventTrigger, integration models.Integration) {

}
