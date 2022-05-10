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

func (manager *executionManager) SetExecutionTime(accountId string, executionId int, seconds int) error {
	dt := ExecutionDto{AccountId: accountId, ExecutionId: strconv.Itoa(executionId), Seconds: seconds}
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
	_, err, status, _ := httpHelper.HttpRequest(http.MethodPost, config.Configs.Endpoints.PlanManager+"/execution/submit", requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		return err
	}
	//fmt.Println(string(out))
	if status != http.StatusOK && status != http.StatusAccepted {
		return errors.New("not ok with status: " + strconv.Itoa(status))
	}
	return nil
}

type ExecutionDto struct {
	AccountId   string `json:"account_id" binding:"required"`
	ExecutionId string `json:"execution_id" binding:"required"`
	Seconds     int    `json:"seconds" binding:"required"`
}
