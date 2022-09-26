package triggerService

import (
	"context"
	"errors"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/executionService"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/services/utopiopsService"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
	"github.com/dotenx/dotenx/ao-api/stores/pipelineStore"
	"github.com/dotenx/dotenx/ao-api/stores/triggerStore"
	"github.com/go-co-op/gocron"
)

var ActiveSchedulers map[string]*gocron.Scheduler

func init() {
	ActiveSchedulers = make(map[string]*gocron.Scheduler)
}

type TriggerService interface {
	GetTriggerTypes() (map[string][]triggerSummery, error)
	GetAllTriggers() ([]models.EventTrigger, error)
	GetAllTriggersForAccount(accountId string) ([]models.EventTrigger, error)
	// This function finds all the triggers of a pipeline
	GetAllTriggersForPipelineByEndpoint(pipelineEndpoint string) ([]models.EventTrigger, error)
	GetAllTriggersForAccountByType(accountId, triggerType string) ([]models.EventTrigger, error)
	GetDefinitionForTrigger(accountId, triggerType string) (models.TriggerDefinition, error)
	AddTriggers(accountId, projectName string, triggers []*models.EventTrigger, endpoint string) error
	UpdateTriggers(accountId, projectName string, triggers []*models.EventTrigger, endpoint string) error
	DeleteTrigger(accountId string, triggerName, pipeline string) error
	StartChecking(store integrationStore.IntegrationStore) error
	StartScheduller() error
	StopScheduler(accId, pipelineName, triggerName string) error
	StartSchedulling(trigger models.EventTrigger) error
}

type TriggerManager struct {
	Store              triggerStore.TriggerStore
	UtopiopsService    utopiopsService.UtopiopsService
	ExecutionService   executionService.ExecutionService
	IntegrationService integrationService.IntegrationService
	PipelineStore      pipelineStore.PipelineStore
}

type triggerSummery struct {
	Type        string `json:"type"`
	IconUrl     string `json:"icon_url"`
	NodeColor   string `json:"node_color"`
	Description string `json:"description"`
}

func NewTriggerService(store triggerStore.TriggerStore, service utopiopsService.UtopiopsService, execService executionService.ExecutionService, intService integrationService.IntegrationService, pipeStore pipelineStore.PipelineStore) TriggerService {
	return &TriggerManager{Store: store, UtopiopsService: service, ExecutionService: execService, IntegrationService: intService, PipelineStore: pipeStore}
}

func (manager *TriggerManager) StopScheduler(accId, pipelineName, triggerName string) error {
	sch, ok := ActiveSchedulers[accId+"_"+pipelineName+"_"+triggerName]
	if !ok {
		return errors.New("no scheduler found")
	}
	sch.Stop()
	return nil
}

func (manager *TriggerManager) GetTriggerTypes() (map[string][]triggerSummery, error) {
	triggers := make(map[string][]triggerSummery)
	for _, integ := range models.AvaliableTriggers {
		if integ.OnTestStage {
			continue
		}
		if _, ok := triggers[integ.Service]; ok {
			triggers[integ.Service] = append(triggers[integ.Service], triggerSummery{Type: integ.Type, IconUrl: integ.Icon, Description: integ.Description})
		} else {
			types := make([]triggerSummery, 0)
			types = append(types, triggerSummery{Type: integ.Type, IconUrl: integ.Icon, Description: integ.Description, NodeColor: integ.NodeColor})
			triggers[integ.Service] = types
		}

	}
	return triggers, nil
}

func (manager *TriggerManager) AddTriggers(accountId string, projectName string, triggers []*models.EventTrigger, endpoint string) (err error) {
	for _, tr := range triggers {
		tr.Endpoint = endpoint
		tr.AccountId = accountId
		if !tr.IsValid() {
			return errors.New("invalid trigger dto")
		}
		err = manager.Store.AddTrigger(context.Background(), accountId, projectName, *tr)
		if err == nil {
			if tr.Type == "Schedule" {
				err = manager.StartSchedulling(*tr)
				if err != nil {
					return
				}
			}
		} else {
			return
		}
	}
	return
}

func (manager *TriggerManager) UpdateTriggers(accountId, projectName string, triggers []*models.EventTrigger, endpoint string) (err error) {
	if len(triggers) == 0 {
		return nil
	}
	err = manager.Store.DeleteTriggersForPipeline(context.Background(), accountId, triggers[0].Pipeline)
	if err != nil {
		return errors.New("error in deleting old triggers: " + err.Error())
	}
	for _, tr := range triggers {
		tr.Endpoint = endpoint
		tr.AccountId = accountId
		if !tr.IsValid() {
			return errors.New("invalid trigger dto")
		}
		err = manager.Store.AddTrigger(context.Background(), accountId, projectName, *tr)
		if err == nil {
			if tr.Type == "Schedule" {
				err = manager.StartSchedulling(*tr)
				if err != nil {
					return
				}
			}
		} else {
			return
		}
	}
	return
}

func (manager *TriggerManager) DeleteTrigger(accountId string, triggerName, pipeline string) error {
	triggers, err := manager.GetAllTriggersForAccount(accountId)
	if err != nil {
		return err
	}
	for _, tr := range triggers {
		if tr.Name == triggerName {
			if tr.Type == "Schedule" {
				err = manager.StopScheduler(accountId, pipeline, triggerName)
				if err != nil {
					return err
				}
			}
			return manager.Store.DeleteTrigger(context.Background(), accountId, triggerName, pipeline)
		}
	}
	return errors.New("no trigger with this name")
}

func (manager *TriggerManager) GetAllTriggers() ([]models.EventTrigger, error) {
	return manager.Store.GetAllTriggers(context.Background())
}
func (manager *TriggerManager) GetAllTriggersForAccount(accountId string) ([]models.EventTrigger, error) {
	return manager.Store.GetAllTriggersForAccount(context.Background(), accountId)
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
