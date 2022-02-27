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

func (manager *TriggerManager) StartChecking(accId string, store integrationStore.IntegrationStore) error {
	triggers, err := manager.Store.GetAllTriggers(context.Background(), accId)
	if err != nil {
		return err
	}
	freq, err := strconv.Atoi(config.Configs.App.CheckTrigger)
	if err != nil {
		return err
	}
	cli, err := client.NewEnvClient()
	if err != nil {
		fmt.Println("Unable to create docker client")
		return err
	}
	for _, trigger := range triggers {
		go cli.handleTrigger(accId, trigger, store, freq)
	}
	return nil
}

func (dockerClient *client.Client) handleTrigger(accountId string, trigger models.EventTrigger, store integrationStore.IntegrationStore, freq int) {
	integration, err := store.GetIntegrationsByName(context.Background(), accountId, trigger.Integration)
	if err != nil {
		return
	}
	for start := time.Now(); time.Since(start) < time.Duration(freq)*time.Second; {
		dockerClient.checkTrigger(trigger, integration)
	}
}

func (dockerClient *client.Client) checkTrigger(trigger models.EventTrigger, integration models.Integration) {

}
