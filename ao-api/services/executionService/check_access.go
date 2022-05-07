package executionService

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

func (manager *executionManager) CheckAccess(accountId string, excutionId int) (bool, error) {
	dt := automationDto{AccountId: accountId, AutomationId: strconv.Itoa(excutionId)}
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
			Value: fmt.Sprintf("Bearer %s", token),
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, config.Configs.Endpoints.PlanManager+"/user/access/executionMinutes", requestBody, Requestheaders, time.Minute, true)
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

type automationDto struct {
	AccountId    string `json:"account_id" binding:"required"`
	AutomationId string `json:"automation_id" binding:"required"`
}
