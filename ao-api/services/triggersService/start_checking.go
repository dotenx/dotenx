package triggerService

import (
	"context"
	"time"

	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/integrationStore"
)

func (manager *TriggerManager) StartChecking(accId string, store integrationStore.IntegrationStore) error {
	triggers, err := manager.Store.GetAllTriggers(context.Background(), accId)
	if err != nil {
		return err
	}
	return nil
}

func handleTrigger(trigger models.EventTrigger, store integrationStore.IntegrationStore) {
	//integration, err := store.GetIntegrationByName()
	for start := time.Now(); time.Since(start) < time.Duration()*time.Second; {
		checkTrigger()
	}
}
