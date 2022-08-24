package executionService

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (manager *executionManager) SetExecutionTime(executionId int, seconds int) error {
	err := manager.Store.SetExecutionTime(executionId, seconds)
	if err != nil {
		return err
	}
	accountId, err := manager.Store.GetAccountIdByExecutionId(noContext, executionId)
	if err != nil {
		return err
	}
	dt := ExecutionDto{AccountId: accountId, ExecutionId: strconv.Itoa(executionId), Seconds: seconds}
	logrus.Println(dt)
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
			Value: token,
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, config.Configs.Endpoints.Admin+"/internal/execution/submit", requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		return err
	}
	//fmt.Println(string(out))
	if status != http.StatusOK && status != http.StatusAccepted {
		logrus.Println(string(out))
		return errors.New("not ok with status: " + strconv.Itoa(status))
	}
	return nil
}

type ExecutionDto struct {
	AccountId   string `json:"account_id" binding:"required"`
	ExecutionId string `json:"execution_id" binding:"required"`
	Seconds     int    `json:"seconds" binding:"required"`
}
