package crudService

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (cm *crudManager) CreateFromTemplate(base *models.Pipeline, pipeline *models.PipelineVersion, fields map[string]interface{}) (name string, err error) {
	tasks := make(map[string]models.Task)
	for taskName, task := range pipeline.Manifest.Tasks {
		body := task.Body.(models.TaskBodyMap)
		for k, v := range body {
			val := fmt.Sprintf("%v", v)
			if strings.Contains(val, "$$$.") {
				if ok, taskFields := checkAndPars(fields, taskName); ok {
					val = strings.Replace(val, "$$$.", "", 1)
					value, ok := taskFields[val]
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
		if task.Integration != "" && strings.Contains(task.Integration, "$$$.") {
			task.Integration = strings.Replace(task.Integration, "$$$.", "", 1)
			if ok, taskFields := checkAndPars(fields, taskName); ok {
				value, ok := taskFields[task.Integration]
				if !ok {
					return "", errors.New("there is no integration in " + taskName + " body")
				}
				exists, err := cm.checkIfIntegrationExists(base.AccountId, fmt.Sprintf("%v", value))
				if err != nil || !exists {
					return "", errors.New("your inputed integration as " + fmt.Sprintf("%v", value) + " does not exists or does not have a provider")
				}
				task.Integration = fmt.Sprintf("%v", value)
			} else {
				return "", errors.New("there is no body for task named " + taskName)
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
			if strings.Contains(val, "$$$.") {
				if ok, triggerFields := checkAndPars(fields, triggerName); ok {
					val = strings.Replace(val, "$$$.", "", 1)
					value, ok := triggerFields[val]
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
		if trigger.Integration != "" && strings.Contains(trigger.Integration, "$$$.") {
			trigger.Integration = strings.Replace(trigger.Integration, "$$$.", "", 1)
			if ok, triggerFields := checkAndPars(fields, triggerName); ok {
				value, ok := triggerFields[trigger.Integration]
				if !ok {
					return "", errors.New("there is no integration in " + triggerName + " body")
				}
				exists, err := cm.checkIfIntegrationExists(base.AccountId, fmt.Sprintf("%v", value))
				if err != nil || !exists {
					return "", errors.New("your inputed integration as " + fmt.Sprintf("%v", value) + " does not exists or does not have a provider")
				}
				trigger.Integration = fmt.Sprintf("%v", value)
			} else {
				return "", errors.New("there is no body for task named " + triggerName)
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
		fields := make(map[string]string)
		body := task.Body.(models.TaskBodyMap)
		for key, value := range body {
			strVal := fmt.Sprintf("%v", value)
			if strings.Contains(strVal, "$$$.") {
				keyValue := strings.ReplaceAll(strVal, "$$$.", "")
				//detailes[taskName+":"+key] = keyValue
				fields[key] = keyValue
			}
		}
		if task.Integration != "" && strings.Contains(task.Integration, "$$$.") {
			strIntegration := strings.Replace(task.Integration, "$$$.", "", 1)
			//detailes[taskName+":integration"] = strIntegration
			fields["integration"] = strIntegration
			//detailes[taskName] = strIntegration
		}
		detailes[taskName] = fields
	}

	for triggerName, trigger := range temp.Manifest.Triggers {
		fields := make(map[string]string)
		for key, value := range trigger.Credentials {
			strVal := fmt.Sprintf("%v", value)
			if strings.Contains(strVal, "$$$.") {
				keyValue := strings.ReplaceAll(strVal, "$$$.", "")
				//detailes[triggerName+":"+key] = keyValue
				fields[key] = keyValue
			}
		}
		if trigger.Integration != "" && strings.Contains(trigger.Integration, "$$$.") {
			strIntegration := strings.Replace(trigger.Integration, "$$$.", "", 1)
			//detailes[triggerName+":integration"] = strIntegration
			fields["integration"] = strIntegration
		}
		detailes[triggerName] = fields
	}
	return
}

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
