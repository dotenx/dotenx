package crudService

import (
	"errors"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (cm *crudManager) CreatePipeLine(base *models.Pipeline, pipeline *models.PipelineVersion, isTemplate bool, isInteraction bool) (err error) {
	// checking if all integrations in an interaction or template have provider
	for _, task := range pipeline.Manifest.Tasks {
		if task.Integration != "" && (isInteraction || isTemplate) {
			integration, err := cm.IntegrationService.GetIntegrationByName(base.AccountId, task.Integration)
			if err != nil {
				return err
			}
			if integration.Provider == "" {
				return errors.New("your integrations must have provider")
			}
		}
		if isInteraction {
			body := task.Body.(models.TaskBodyMap)
			for key, value := range body {
				if fmt.Sprintf("%v", value) == "" {
					val := insertDto{
						Source: config.Configs.App.InteractionBodyKey,
						Key:    key,
					}
					body[key] = val
				}
			}
		}
	}
	for _, trigger := range pipeline.Manifest.Triggers {
		if trigger.Integration != "" && (isInteraction || isTemplate) {
			integration, err := cm.IntegrationService.GetIntegrationByName(base.AccountId, trigger.Integration)
			if err != nil {
				return err
			}
			if integration.Provider == "" {
				if isInteraction || isTemplate {
					return errors.New("your integrations must have provider")
				}
			}
		}
	}
	err = cm.Store.Create(noContext, base, pipeline, isTemplate, isInteraction)
	if err != nil {
		return
	}
	_, e, _, _, _, err := cm.Store.GetByName(noContext, base.AccountId, base.Name)
	if err != nil {
		return
	}
	triggers := make([]*models.EventTrigger, 0)
	for _, tr := range pipeline.Manifest.Triggers {
		tr.Endpoint = e
		tr.Pipeline = base.Name
		triggers = append(triggers, &models.EventTrigger{
			Name:        tr.Name,
			AccountId:   tr.AccountId,
			Type:        tr.Type,
			Endpoint:    e,
			Pipeline:    base.Name,
			Integration: tr.Integration,
			Credentials: tr.Credentials,
		})
	}
	return cm.TriggerService.AddTriggers(base.AccountId, triggers, e)
}

func (cm *crudManager) UpdatePipeline(base *models.Pipeline, pipeline *models.PipelineVersion) error {
	p, _, isActive, isTemplate, isInteraction, err := cm.Store.GetByName(noContext, base.AccountId, base.Name)
	if err == nil && p.Id != "" {
		err := cm.DeletePipeline(base.AccountId, base.Name, true)
		if err != nil {
			return errors.New("error in deleting old version: " + err.Error())
		}
		for _, task := range pipeline.Manifest.Tasks {
			if task.Integration != "" && (isInteraction || isTemplate) {
				integration, err := cm.IntegrationService.GetIntegrationByName(base.AccountId, task.Integration)
				if err != nil {
					return err
				}
				if integration.Provider == "" {
					return errors.New("your integrations must have provider")
				}
			}
			if isInteraction {
				body := task.Body.(models.TaskBodyMap)
				for key, value := range body {
					if fmt.Sprintf("%v", value) == "" {
						val := insertDto{
							Source: config.Configs.App.InteractionBodyKey,
							Key:    key,
						}
						body[key] = val
					}
				}
			}
		}
		for _, trigger := range pipeline.Manifest.Triggers {
			if trigger.Integration != "" && isTemplate {
				integration, err := cm.IntegrationService.GetIntegrationByName(base.AccountId, trigger.Integration)
				if err != nil {
					return err
				}
				if integration.Provider == "" {
					return errors.New("your integrations must have provider")
				}
			}
		}
		err = cm.Store.Create(noContext, base, pipeline, isTemplate, isInteraction)
		if err != nil {
			return errors.New("error in creating new version: " + err.Error())
		}
		newP, endpoint, _, _, _, err := cm.GetPipelineByName(base.AccountId, base.Name)
		if err != nil {
			log.Println(err)
			return err
		}
		if isActive {
			err := cm.ActivatePipeline(base.AccountId, newP.Id)
			if err != nil {
				log.Println(err)
				return err
			}
		}
		triggers := make([]*models.EventTrigger, 0)
		for _, tr := range pipeline.Manifest.Triggers {
			triggers = append(triggers, &models.EventTrigger{
				Name:        tr.Name,
				AccountId:   tr.AccountId,
				Type:        tr.Type,
				Endpoint:    tr.Endpoint,
				Pipeline:    tr.Pipeline,
				Integration: tr.Integration,
				Credentials: tr.Credentials,
			})
		}
		return cm.TriggerService.UpdateTriggers(base.AccountId, triggers, endpoint)
	} else {
		return errors.New("your Automation has not been saved yet")
	}
}

func (cm *crudManager) GetPipelineByName(accountId string, name string) (models.PipelineVersion, string, bool, bool, bool, error) {
	pipe, endpoint, isActive, isTemplate, isInteraction, err := cm.Store.GetByName(noContext, accountId, name)
	if err != nil {
		return models.PipelineVersion{}, "", false, false, false, err
	}
	triggers, err := cm.TriggerService.GetAllTriggersForPipeline(accountId, name)
	if err != nil {
		return models.PipelineVersion{}, "", false, false, false, err
	}
	pipe.Manifest.Triggers = make(map[string]models.EventTrigger)
	for _, tr := range triggers {
		pipe.Manifest.Triggers[tr.Name] = tr
	}
	return pipe, endpoint, isActive, isTemplate, isInteraction, nil
}

func (cm *crudManager) GetPipelines(accountId string) ([]models.Pipeline, error) {
	return cm.Store.GetPipelines(noContext, accountId)
}

func (cm *crudManager) DeletePipeline(accountId, name string, deleteRecord bool) (err error) {
	p, _, isActive, _, _, err := cm.GetPipelineByName(accountId, name)
	if err != nil {
		return
	}
	if isActive {
		err = cm.DeActivatePipeline(accountId, p.Id, deleteRecord)
		if err != nil {
			return
		}
	}
	return cm.Store.DeletePipeline(noContext, accountId, name)
}

func (cm *crudManager) GetAllExecutions(accountId string, name string) ([]models.Execution, error) {
	pipelineId, err := cm.Store.GetPipelineId(noContext, accountId, name)
	if err != nil {
		return nil, err
	}
	return cm.Store.GetAllExecutions(noContext, pipelineId)
}

type automationDto struct {
	AccountId    string `json:"account_id" binding:"required"`
	AutomationId string `json:"automation_id" binding:"required"`
	DeleteRecord bool   `json:"delete_record"`
}

func (cm *crudManager) checkIfIntegrationExists(accountId, integration string) (exists bool, err error) {
	integrations, err := cm.IntegrationService.GetAllIntegrations(accountId)
	if err != nil {
		return
	}
	for _, intg := range integrations {
		if intg.Name == integration {
			if intg.Provider != "" {
				return true, nil
			} else {
				return false, errors.New("all integration for template must have provider")
			}
		}
	}
	return false, errors.New("no integration was found")
}

type insertDto struct {
	Source string `json:"source"`
	Key    string `json:"key"`
}
