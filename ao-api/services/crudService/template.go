package crudService

import (
	"errors"
	"fmt"
	"log"
	"reflect"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (cm *crudManager) CreateFromTemplate(base *models.Pipeline, pipeline *models.PipelineVersion, fields map[string]interface{}, tpAccountId string) (name string, err error) {
	tasks := make(map[string]models.Task)
	for taskName, task := range pipeline.Manifest.Tasks {
		body := task.Body.(models.TaskBodyMap)
		for k, v := range body {
			val := fmt.Sprintf("%v", v)
			log.Println("valueeeeeeeeeee:" + val)
			if val == "" {
				if ok, taskFields := checkAndPars(fields, taskName); ok {
					value, ok := taskFields[k]
					if ok {
						body[k] = value
					} else {
						return "", errors.New("there is no field named " + k + " in " + taskName + " body")
					}
				} else {
					return "", errors.New("there is no body for task named " + taskName)
				}
			}
		}
		task.Body = body
		if task.Integration == "" {
			task.MetaData = models.AvaliableTasks[task.Type]
			if len(task.MetaData.Integrations) > 0 {
				// TODO handle multiple integraton type tasks and triggers
				integ, err := cm.IntegrationService.GetIntegrationForThirdPartyAccount(base.AccountId, tpAccountId, task.MetaData.Integrations[0])
				if err != nil {
					return "", err
				}
				task.Integration = integ.Name
			}
		}
		tasks[taskName] = models.Task{
			Name:         task.Name,
			Description:  task.Description,
			ExecuteAfter: task.ExecuteAfter,
			Type:         task.Type,
			Body:         task.Body,
			Integration:  task.Integration,
			MetaData:     task.MetaData,
		}
	}
	pipeline.Manifest.Tasks = tasks
	triggers := make(map[string]models.EventTrigger)
	for triggerName, trigger := range pipeline.Manifest.Triggers {
		for k, v := range trigger.Credentials {
			val := fmt.Sprintf("%v", v)
			if val == "" {
				if ok, triggerFields := checkAndPars(fields, triggerName); ok {
					value, ok := triggerFields[k]
					if ok {
						trigger.Credentials[k] = value
					} else {
						return "", errors.New("there is no field named " + k + " in " + triggerName + " body")
					}
				} else {
					return "", errors.New("there is no body for trigger named " + triggerName)
				}
			}
		}
		if trigger.Integration == "" {
			trigger.MetaData = models.AvaliableTriggers[trigger.Type]
			if len(trigger.MetaData.IntegrationTypes) > 0 {
				// TODO handle multiple integraton type tasks and triggers
				integ, err := cm.IntegrationService.GetIntegrationForThirdPartyAccount(base.AccountId, tpAccountId, trigger.MetaData.IntegrationTypes[0])
				if err != nil {
					return "", err
				}
				trigger.Integration = integ.Name
			}
		}
		triggers[trigger.Name] = models.EventTrigger{
			Name:        trigger.Name,
			AccountId:   trigger.AccountId,
			Type:        trigger.Type,
			Endpoint:    trigger.Endpoint,
			Pipeline:    trigger.Pipeline,
			Integration: trigger.Integration,
			Credentials: trigger.Credentials,
			MetaData:    trigger.MetaData,
		}
	}
	pipeline.Manifest.Triggers = triggers
	base.Name = base.Name + "_" + utils.GetNewUuid()
	err = cm.Store.Create(noContext, base, pipeline, false, false)
	if err != nil {
		return
	}
	_, e, _, _, _, err := cm.Store.GetByName(noContext, base.AccountId, base.Name)
	if err != nil {
		return
	}
	triggers2 := make([]*models.EventTrigger, 0)
	for _, tr := range pipeline.Manifest.Triggers {
		tr.Endpoint = e
		tr.Pipeline = base.Name
		triggers2 = append(triggers2, &models.EventTrigger{
			Name:        tr.Name,
			AccountId:   tr.AccountId,
			Type:        tr.Type,
			Endpoint:    e,
			Pipeline:    base.Name,
			Integration: tr.Integration,
			Credentials: tr.Credentials,
		})
	}
	return base.Name, cm.TriggerService.AddTriggers(base.AccountId, triggers2, e)
}

// function to iterate over template tasks and triggers fields and if their value were empty,
// we will pass them to front to get them when we want create from template

func (cm *crudManager) GetTemplateDetailes(accountId string, name string) (detailes map[string]interface{}, err error) {
	detailes = make(map[string]interface{})
	temp, _, _, isTemplate, _, err := cm.GetPipelineByName(accountId, name)
	if err != nil {
		return
	}
	if !isTemplate {
		return nil, errors.New("it is not a template")
	}
	for taskName, task := range temp.Manifest.Tasks {
		fields := make([]string, 0)
		body := task.Body.(models.TaskBodyMap)
		for key, value := range body {
			strVal := fmt.Sprintf("%v", value)
			if strVal == "" { // if value is empty means that we must get it when we want to create from template
				fields = append(fields, key)
			}
		}
		if len(fields) > 0 {
			detailes[taskName] = fields
		}
	}
	for triggerName, trigger := range temp.Manifest.Triggers {
		fields := make([]string, 0)
		for key, value := range trigger.Credentials {
			strVal := fmt.Sprintf("%v", value)
			if strVal == "" {
				fields = append(fields, key)
			}
		}
		if len(fields) > 0 {
			detailes[triggerName] = fields
		}
	}
	return
}

// this function checks if interface with given key in given map is parsable to map[string]inerface{}

func checkAndPars(body map[string]interface{}, key string) (bool, map[string]interface{}) {
	if taskFields, ok := body[key]; ok {
		var testType map[string]interface{}
		if !reflect.TypeOf(taskFields).ConvertibleTo(reflect.TypeOf(testType)) {
			return false, nil
		}
		return true, taskFields.(map[string]interface{})
	}
	return false, nil
}
