package utils

import (
	bytesPkg "bytes"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
)

func GetUserPlan(accountId string) (map[string]interface{}, error) {
	dt := map[string]interface{}{
		"account_id": accountId,
	}
	json_data, err := json.Marshal(dt)
	if err != nil {
		return nil, errors.New("bad input body")
	}
	requestBody := bytesPkg.NewBuffer(json_data)
	token, err := GeneratToken()
	if err != nil {
		return nil, err
	}
	Requestheaders := []Header{
		{
			Key:   "Authorization",
			Value: token,
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	httpHelper := NewHttpHelper(NewHttpClient())
	out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, config.Configs.Endpoints.Admin+"/internal/user/plan/current", requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		return nil, err
	}
	if status != http.StatusOK && status != http.StatusAccepted {
		return nil, errors.New("not ok with status: " + strconv.Itoa(status))
	}
	var res map[string]interface{}
	if err := json.Unmarshal(out, &res); err != nil {
		return nil, err
	}
	return res, nil
}
