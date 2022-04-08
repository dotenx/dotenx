package triggerService

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/go-co-op/gocron"
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
	s := gocron.NewScheduler(time.UTC)
	if freq, ok := trigger.Credentials["frequency"]; !ok || freq == "" {
		return errors.New("invalid frequency")
	}
	if t, ok := trigger.Credentials["time"]; !ok || t == "" {
		return errors.New("invalid time")
	}
	freq, err := strconv.Atoi(trigger.Credentials["frequency"].(string))
	if err != nil {
		return err
	}
	s.Every(freq).Second().Do(manager.ExecutionService.StartPipeline(nil, trigger.AccountId, trigger.Endpoint))
	//s.Every(freq).Day().At(trigger.Credentials["time"].(string)).Do(manager.ExecutionService.StartPipeline(nil, trigger.AccountId, trigger.Endpoint))
	s.StartAsync()
	return nil
}
