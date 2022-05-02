package crudService

import (
	"errors"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (cm *crudManager) CreatePipeLine(base *models.Pipeline, pipeline *models.PipelineVersion) (err error) {
	err = cm.Store.Create(noContext, base, pipeline)
	if err != nil {
		return
	}
	_, e, _, err := cm.Store.GetByName(noContext, base.AccountId, base.Name)
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
	p, _, _, err := cm.GetPipelineByName(base.AccountId, base.Name)
	if err == nil && p.Id != "" {
		err := cm.DeletePipeline(base.AccountId, base.Name)
		if err != nil {
			return errors.New("error in deleting old version: " + err.Error())
		}
		err = cm.Store.Create(noContext, base, pipeline)
		if err != nil {
			return errors.New("error in creating new version: " + err.Error())
		}
		_, endpoint, _, err := cm.GetPipelineByName(base.AccountId, base.Name)
		if err != nil {
			return err
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

func (cm *crudManager) GetPipelineByName(accountId string, name string) (models.PipelineVersion, string, bool, error) {
	pipe, endpoint, isActive, err := cm.Store.GetByName(noContext, accountId, name)
	if err != nil {
		return models.PipelineVersion{}, "", false, err
	}
	triggers, err := cm.TriggerService.GetAllTriggersForPipeline(accountId, name)
	if err != nil {
		return models.PipelineVersion{}, "", false, err
	}
	pipe.Manifest.Triggers = make(map[string]models.EventTrigger)
	for _, tr := range triggers {
		pipe.Manifest.Triggers[tr.Name] = tr
	}
	return pipe, endpoint, isActive, nil
}
func (cm *crudManager) GetPipelines(accountId string) ([]models.Pipeline, error) {
	return cm.Store.GetPipelines(noContext, accountId)
}
func (cm *crudManager) DeletePipeline(accountId, name string) (err error) {
	return cm.Store.DeletePipeline(noContext, accountId, name)
}

func (cm *crudManager) GetAllExecutions(accountId string, name string) ([]models.Execution, error) {
	pipelineId, err := cm.Store.GetPipelineId(noContext, accountId, name)
	if err != nil {
		return nil, err
	}
	return cm.Store.GetAllExecutions(noContext, pipelineId)
}

func (cm *crudManager) ActivatePipeline(accountId, pipelineId string) (err error) {
	return cm.Store.ActivatePipeline(noContext, accountId, pipelineId)
}

func (cm *crudManager) DeActivatePipeline(accountId, pipelineId string) (err error) {
	return cm.Store.DeActivatePipeline(noContext, accountId, pipelineId)
}

func (cm *crudManager) GetActivePipelines(accountId string) ([]models.Pipeline, error) {
	pipelines, err := cm.Store.GetPipelines(noContext, accountId)
	if err != nil {
		return nil, err
	}
	actives := make([]models.Pipeline, 0)
	for _, p := range pipelines {
		if p.IsActive {
			actives = append(actives, p)
		}
	}
	return actives, nil
}
