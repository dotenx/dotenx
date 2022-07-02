package crudService

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (cm *crudManager) CreatePipeLine(base *models.Pipeline, pipeline *models.PipelineVersion, isTemplate bool, isInteraction bool) (err error) {
	// checking if all integrations in an interaction or template have provider
	for _, task := range pipeline.Manifest.Tasks {
		if task.Integration != "" && strings.Contains(task.Integration, "$$$.") {
			integration, err := cm.IntegrationService.GetIntegrationByName(base.AccountId, task.Integration)
			if err != nil {
				return err
			}
			if integration.Provider == "" {
				if isInteraction || isTemplate {
					return errors.New("your integrations must have provider")
				}
			}
		}
		if isInteraction {
			body := task.Body.(models.TaskBodyMap)
			for key, value := range body {
				if fmt.Sprintf("%v", value) == "" {
					val := insertDto{
						Source: "interactionRunTime",
						Key:    key,
					}
					body[key] = val
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

func (cm *crudManager) ActivatePipeline(accountId, pipelineId string) (err error) {
	id, _ := strconv.Atoi(pipelineId)
	hasAccess, err := cm.CheckAccess(accountId, id)
	if err != nil {
		return err
	}
	if !hasAccess {
		return errors.New("you have reached your limit")
	}
	err = cm.Store.ActivatePipeline(noContext, accountId, pipelineId)
	if err != nil {
		return
	}
	return cm.NotifyPlanmanageForActivation(accountId, "activate", pipelineId, false)
}

func (cm *crudManager) CheckAccess(accId string, excutionId int) (bool, error) {
	dt := automationDto{AccountId: accId, AutomationId: strconv.Itoa(excutionId)}
	json_data, err := json.Marshal(dt)
	if err != nil {
		return false, errors.New("bad input body")
	}
	requestBody := bytes.NewBuffer(json_data)
	token, err := utils.GeneratToken()
	if err != nil {
		return false, err
	}
	Requestheaders := []utils.Header{
		{
			Key:   "Authorization",
			Value: token,
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, config.Configs.Endpoints.Admin+"/internal/user/access/automation", requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		return false, err
	}
	//fmt.Println(string(out))
	if status != http.StatusOK && status != http.StatusAccepted {
		return false, errors.New("not ok with status: " + strconv.Itoa(status))
	}
	var res struct {
		Access bool `json:"access"`
	}
	if err := json.Unmarshal(out, &res); err != nil {
		return false, err
	}

	return res.Access, nil
}

func (cm *crudManager) DeActivatePipeline(accountId, pipelineId string, deleteRecord bool) (err error) {
	err = cm.Store.DeActivatePipeline(noContext, accountId, pipelineId)
	if err != nil {
		return
	}
	return cm.NotifyPlanmanageForActivation(accountId, "deactivate", pipelineId, deleteRecord)
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
		if task.Integration != "" {
			if strings.Contains(task.Integration, "$$$.") {
				task.Integration = strings.Replace(task.Integration, "$$$.", "", 1)
				value, ok := fields[task.Integration]
				if ok {
					exists, err := cm.checkIfIntegrationExists(base.AccountId, fmt.Sprintf("%v", value))
					if err != nil || !exists {
						return "", errors.New("your inputed integration as " + fmt.Sprintf("%v", value) + " does not exists")
					}
					task.Integration = fmt.Sprintf("%v", value)
				}
			} else {
				exists, err := cm.checkIfIntegrationExists(base.AccountId, task.Integration)
				if err != nil || !exists {
					return "", errors.New("your inputed integration as " + task.Integration + " does not exists or you cant use it")
				}
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
		if trigger.Integration != "" {
			if strings.Contains(trigger.Integration, "$$$.") {
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
			} else {
				exists, err := cm.checkIfIntegrationExists(base.AccountId, trigger.Integration)
				if err != nil || !exists {
					return "", errors.New("your inputed integration as " + trigger.Integration + " does not exists or you cant use it")
				}
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
func (cm *crudManager) GetInteractionDetailes(accountId string, name string) (detailes []string, err error) {
	detailes = make([]string, 0)
	temp, _, _, _, isInteraction, err := cm.GetPipelineByName(accountId, name)
	if err != nil {
		return
	}
	if !isInteraction {
		return nil, errors.New("it is not a interaction")
	}
	for _, task := range temp.Manifest.Tasks {
		body := task.Body.(models.TaskBodyMap)
		for key, value := range body {
			var insertDt insertDto
			b, _ := json.Marshal(value)
			err := json.Unmarshal(b, &insertDt)
			if err == nil && insertDt.Key != "" && insertDt.Source != "" {
				if insertDt.Source == "interactionRunTime" {
					detailes = append(detailes, key)
				}
			}
		}
	}
	return
}

type insertDto struct {
	Source string `json:"source"`
	Key    string `json:"key"`
}
