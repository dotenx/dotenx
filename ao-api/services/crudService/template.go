package crudService

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"reflect"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

// this methods create an Automation from given base template and fields
func (cm *crudManager) CreateFromTemplate(base *models.Pipeline, pipeline *models.PipelineVersion, fields map[string]interface{}, tpAccountId string, projectName string, parentId int) (name string, err error) {
	pipeline.Manifest.Tasks, err = cm.fillTasks(pipeline.Manifest.Tasks, fields, base.AccountId, tpAccountId)
	if err != nil {
		return "", err
	}
	base.Name = base.Name + "_" + utils.GetNewUuid()
	err = cm.Store.Create(noContext, base, pipeline, false, false, projectName, parentId, tpAccountId)
	if err != nil {
		return
	}
	newPipeline, err := cm.Store.GetByName(noContext, base.AccountId, base.Name, projectName)
	if err != nil {
		return
	}
	filledTriggers, err := cm.fillTriggers(pipeline.Manifest.Triggers, fields, base.AccountId, tpAccountId, newPipeline.Endpoint, base.Name, projectName)
	if err != nil {
		return "", err
	}
	err = cm.TriggerService.AddTriggers(base.AccountId, base.ProjectName, filledTriggers, newPipeline.Endpoint)
	if err != nil {
		log.Println(err)
		return "", err
	}
	return base.Name, cm.ActivatePipeline(base.AccountId, newPipeline.PipelineDetailes.Id)
}

// function to iterate over template tasks and triggers fields and if their value were empty,
// we will pass them to front to get them when we want create from template
func (cm *crudManager) GetTemplateDetailes(accountId string, name, projectName string) (detailes map[string]interface{}, err error) {
	detailes = make(map[string]interface{})
	temp, err := cm.GetPipelineByName(accountId, name, projectName)
	if err != nil {
		return
	}
	if !temp.IsTemplate {
		return nil, errors.New("it is not a template")
	}
	for taskName, task := range temp.PipelineDetailes.Manifest.Tasks {
		fields := make([]string, 0)
		body := task.Body.(models.TaskBodyMap)
		for key, value := range body {
			var insertDt models.TaskFieldDetailes
			b, _ := json.Marshal(value)
			err := json.Unmarshal(b, &insertDt)
			if err != nil {
				return nil, err
			}
			if insertDt.Type == models.DirectValueFieldType && fmt.Sprintf("%v", insertDt.Value) == "" {
				fields = append(fields, key)
			}
		}
		if len(fields) > 0 {
			detailes[taskName] = fields
		}
	}
	for triggerName, trigger := range temp.PipelineDetailes.Manifest.Triggers {
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

// this function iterates over tasks and for each task field with empty value checks fields map for it and finally set tasks integration (based on third party account id)
func (cm *crudManager) fillTasks(emptyTasks map[string]models.Task, fields map[string]interface{}, accountId, tpAccountId string) (map[string]models.Task, error) {
	tasks := make(map[string]models.Task)
	for taskName, task := range emptyTasks {
		body := task.Body.(models.TaskBodyMap)
		for k, v := range body {
			var insertDt models.TaskFieldDetailes
			b, _ := json.Marshal(v)
			err := json.Unmarshal(b, &insertDt)
			if err != nil {
				return nil, err
			}
			if insertDt.Type == models.DirectValueFieldType && fmt.Sprintf("%v", insertDt.Value) == "" {
				if ok, taskFields := checkAndPars(fields, taskName); ok {
					value, ok := taskFields[k]
					if ok {
						body[k] = value
					} else {
						return nil, errors.New("there is no field named " + k + " in " + taskName + " body")
					}
				} else {
					return nil, errors.New("there is no body for task named " + taskName)
				}
			}
		}
		task.Body = body
		if task.Integration == "" {
			task.MetaData = models.AvaliableTasks[task.Type]
			if len(task.MetaData.Integrations) > 0 {
				integ, err := cm.IntegrationService.GetIntegrationForThirdPartyAccount(accountId, tpAccountId, task.MetaData.Integrations[0])
				if err != nil {
					return nil, err
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
	return tasks, nil
}

// this function iterates over triggers and for each trigger field with empty value checks fields map for it and finally set triggers integration (based on third party account id)
func (cm *crudManager) fillTriggers(emptyTriggers map[string]models.EventTrigger, fields map[string]interface{}, accountId, tpAccountId, endpoint, pipelineName, projectname string) ([]*models.EventTrigger, error) {
	triggers := make([]*models.EventTrigger, 0)
	for triggerName, trigger := range emptyTriggers {
		for k, v := range trigger.Credentials {
			val := fmt.Sprintf("%v", v)
			if val == "" {
				if ok, triggerFields := checkAndPars(fields, triggerName); ok {
					value, ok := triggerFields[k]
					if ok {
						trigger.Credentials[k] = value
					} else {
						return nil, errors.New("there is no field named " + k + " in " + triggerName + " body")
					}
				} else {
					return nil, errors.New("there is no body for trigger named " + triggerName)
				}
			}
		}
		if trigger.Integration == "" {
			trigger.MetaData = models.AvaliableTriggers[trigger.Type]
			if len(trigger.MetaData.IntegrationTypes) > 0 {
				integ, err := cm.IntegrationService.GetIntegrationForThirdPartyAccount(accountId, tpAccountId, trigger.MetaData.IntegrationTypes[0])
				if err != nil {
					return nil, err
				}
				trigger.Integration = integ.Name
			}
		}
		triggers = append(triggers, &models.EventTrigger{
			Name:        trigger.Name,
			AccountId:   trigger.AccountId,
			Type:        trigger.Type,
			Endpoint:    endpoint,
			Pipeline:    pipelineName,
			Integration: trigger.Integration,
			Credentials: trigger.Credentials,
			MetaData:    trigger.MetaData,
			ProjectName: projectname,
		})
	}
	return triggers, nil
}
