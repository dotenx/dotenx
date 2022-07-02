package crudService

import (
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (cm *crudManager) CreateFromTemplate(base *models.Pipeline, pipeline *models.PipelineVersion, fields map[string]interface{}) (name string, err error) {
	tasks := make(map[string]models.Task)
	for _, task := range pipeline.Manifest.Tasks {
		body := task.Body.(models.TaskBodyMap)
		for k, v := range body {
			val := fmt.Sprintf("%v", v)
			if strings.Contains(val, "$$$.") {
				val = strings.Replace(val, "$$$.", "", 1)
				value, ok := fields[val]
				if ok {
					body[k] = value
				}
			}
		}
		task.Body = body
		if task.Integration != "" && strings.Contains(task.Integration, "$$$.") {
			task.Integration = strings.Replace(task.Integration, "$$$.", "", 1)
			value, ok := fields[task.Integration]
			if ok {
				exists, err := cm.checkIfIntegrationExists(base.AccountId, fmt.Sprintf("%v", value))
				if err != nil || !exists {
					return "", errors.New("your inputed integration as " + fmt.Sprintf("%v", value) + " does not exists")
				}
				task.Integration = fmt.Sprintf("%v", value)
			}
		}
		tasks[task.Name] = models.Task{
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
	for _, trigger := range pipeline.Manifest.Triggers {
		for k, v := range trigger.Credentials {
			val := fmt.Sprintf("%v", v)
			if strings.Contains(val, "$$$.") {
				val = strings.Replace(val, "$$$.", "", 1)
				value, ok := fields[val]
				if ok {
					trigger.Credentials[k] = value
				}
			}
		}
		if trigger.Integration != "" && strings.Contains(trigger.Integration, "$$$.") {
			trigger.Integration = strings.Replace(trigger.Integration, "$$$.", "", 1)
			value, ok := fields[trigger.Integration]
			if ok {
				log.Println("tsssssssss")
				exists, err := cm.checkIfIntegrationExists(base.AccountId, fmt.Sprintf("%v", value))
				if err != nil || !exists {
					return "", errors.New("your inputed integration as " + fmt.Sprintf("%v", value) + " does not exists")
				}
				trigger.Integration = fmt.Sprintf("%v", value)
				log.Println(trigger.Integration)
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

func (cm *crudManager) GetTemplateDetailes(accountId string, name string) (detailes map[string]string, err error) {
	detailes = make(map[string]string)
	temp, _, _, isTemplate, _, err := cm.GetPipelineByName(accountId, name)
	if err != nil {
		return
	}
	if !isTemplate {
		return nil, errors.New("it is now a template")
	}
	for taskName, task := range temp.Manifest.Tasks {
		body := task.Body.(models.TaskBodyMap)
		for key, value := range body {
			strVal := fmt.Sprintf("%v", value)
			if strings.Contains(strVal, "$$$.") {
				keyValue := strings.ReplaceAll(strVal, "$$$.", "")
				detailes[taskName+":"+key] = keyValue
			}
		}
		if task.Integration != "" && strings.Contains(task.Integration, "$$$.") {
			strIntegration := strings.Replace(task.Integration, "$$$.", "", 1)
			detailes[taskName+":integration"] = strIntegration

		}
	}

	for triggerName, trigger := range temp.Manifest.Triggers {
		for key, value := range trigger.Credentials {
			strVal := fmt.Sprintf("%v", value)
			if strings.Contains(strVal, "$$$.") {
				keyValue := strings.ReplaceAll(strVal, "$$$.", "")
				detailes[triggerName+":"+key] = keyValue
			}
		}
		if trigger.Integration != "" && strings.Contains(trigger.Integration, "$$$.") {
			strIntegration := strings.Replace(trigger.Integration, "$$$.", "", 1)
			detailes[triggerName+":integration"] = strIntegration
		}
	}
	return
}
