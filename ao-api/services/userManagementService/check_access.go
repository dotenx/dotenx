package userManagementService

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

func (ums *userManagementService) CheckAccess(accountId string) (bool, error) {
	dto := tpUserDto{
		AccountId: accountId,
	}
	json_data, err := json.Marshal(dto)
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
	url := config.Configs.Endpoints.Admin + "/internal/user/access/tpUser"
	out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		return false, err
	}
	//fmt.Println(string(out))
	if status != http.StatusOK && status != http.StatusAccepted {
		logrus.Println(string(out))
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

type tpUserDto struct {
	AccountId string `json:"account_id" binding:"required"`
}
