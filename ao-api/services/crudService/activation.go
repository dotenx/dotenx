package crudService

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (cm *crudManager) ActivatePipeline(accountId, pipelineId string) (err error) {
	id, _ := strconv.Atoi(pipelineId)
	hasAccess, err := cm.CheckAccess(accountId, id)
	if err != nil {
		return err
	}
	if !hasAccess {
		return utils.ErrReachLimitationOfPlan
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
