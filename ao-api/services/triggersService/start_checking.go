package triggerService

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/docker/docker/client"

	"github.com/utopiops/automated-ops/ao-api/config"
	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/integrationStore"
)

type dockerCleint struct {
	cli *client.Client
}

func (manager *TriggerManager) StartChecking(accId string, store integrationStore.IntegrationStore) error {
	triggers, err := manager.Store.GetAllTriggers(context.Background(), accId)
	if err != nil {
		return err
	}
	freq, err := strconv.Atoi(config.Configs.App.CheckTrigger)
	if err != nil {
		return err
	}
	cli, err := client.NewClientWithOpts()
	if err != nil {
		fmt.Println("Unable to create docker client")
		return err
	}
	dc := dockerCleint{cli: cli}
	for _, trigger := range triggers {
		go dc.handleTrigger(accId, trigger, store, freq)
	}
	return nil
}

func (dc dockerCleint) handleTrigger(accountId string, trigger models.EventTrigger, store integrationStore.IntegrationStore, freq int) {
	integration, err := store.GetIntegrationsByName(context.Background(), accountId, trigger.Integration)
	if err != nil {
		return
	}
	for start := time.Now(); time.Since(start) < time.Duration(freq)*time.Second; {
		dc.checkTrigger(trigger, integration)
	}
}

func (dc dockerCleint) checkTrigger(trigger models.EventTrigger, integration models.Integration) {

}
