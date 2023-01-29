package triggerService

import (
	"context"
	"fmt"

	"github.com/docker/docker/client"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
	"github.com/sirupsen/logrus"
)

func (manager *TriggerManager) HandleEventBridgeScheduler(intgStore integrationStore.IntegrationStore, pipelineEndpoint string) (err error) {
	triggers, err := manager.GetAllTriggersForPipelineByEndpoint(pipelineEndpoint)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	cli, err := client.NewClientWithOpts()
	if err != nil {
		fmt.Println("Unable to create docker client")
		return err
	}
	dc := dockerCleint{cli: cli}

	for _, trigger := range triggers {
		pipeline, err := manager.PipelineStore.GetPipelineByEndpoint(context.Background(), trigger.Endpoint)
		if err != nil {
			fmt.Println("Unable to start checking this trigger:", err.Error())
			continue
		}
		if trigger.Type != "Schedule" && pipeline.IsActive && !pipeline.IsTemplate && !pipeline.IsInteraction {
			go dc.handleTrigger(manager.Store, manager.ExecutionService, manager.IntegrationService, trigger.AccountId, trigger, intgStore, utils.GetNewUuid())
			manager.UtopiopsService.IncrementUsedTimes(models.AvaliableTriggers[trigger.Type].Author, "trigger", trigger.Type)
		}
	}
	return
}
