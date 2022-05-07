package crudService

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (manager *crudManager) NotifyPlanmanageForActivation(accId, action string, pipelineId string) error {
	dt := automationDto{AccountId: accId, AutomationId: pipelineId}
	json_data, err := json.Marshal(dt)
	if err != nil {
		return errors.New("bad input body")
	}
	requestBody := bytes.NewBuffer(json_data)
	token, err := utils.GeneratToken()
	if err != nil {
		return err
	}
	Requestheaders := []utils.Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", token),
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	_, err, status, _ := httpHelper.HttpRequest(http.MethodPost, config.Configs.Endpoints.PlanManager+"/automation/"+action, requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		return err
	}
	//fmt.Println(string(out))
	if status != http.StatusOK && status != http.StatusAccepted {
		return errors.New("not ok with status: " + strconv.Itoa(status))
	}
	return nil
}
