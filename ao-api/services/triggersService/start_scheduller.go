package triggerService

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/models"
)

func (manager *TriggerManager) StartScheduller(accId string) error {
	triggers, err := manager.Store.GetAllTriggers(context.Background(), accId)
	if err != nil {
		return err
	}
	for _, trigger := range triggers {
		if trigger.Type == "Schedule" {
			manager.StartSchedulling(trigger)
			manager.UtopiopsService.IncrementUsedTimes(models.AvaliableTriggers[trigger.Type].Author, "trigger", trigger.Type)
		}
	}
	return nil
}

func (manager *TriggerManager) StartSchedulling(trigger models.EventTrigger) error {

}
