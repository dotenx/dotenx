package triggerService

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/go-co-op/gocron"
)

func (manager *TriggerManager) StartScheduller(accId string) error {
	triggers, err := manager.Store.GetAllTriggers(context.Background(), accId)
	if err != nil {
		return err
	}
	for _, trigger := range triggers {
		if trigger.Type == "Schedule" {
			go manager.StartSchedulling(trigger)
			manager.UtopiopsService.IncrementUsedTimes(models.AvaliableTriggers[trigger.Type].Author, "trigger", trigger.Type)
		}
	}
	return nil
}

func (manager *TriggerManager) StartSchedulling(trigger models.EventTrigger) error {
	s := gocron.NewScheduler(time.UTC)
	if freq, ok := trigger.Credentials["frequency"]; !ok || freq == "" {
		return errors.New("invalid frequency")
	}
	freq, err := strconv.Atoi(trigger.Credentials["frequency"].(string))
	if err != nil {
		return err
	}
	inp := make(map[string]interface{})
	s.Every(freq).Second().Do(func() {
		manager.ExecutionService.StartPipeline(inp, trigger.AccountId, trigger.Endpoint)
	})
	go s.StartBlocking()

	return nil
}
