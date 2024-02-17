package projectService

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

/*
GetDomainPaymentLink sends a reuqest to admin-api to get a Stripe payment link
for purchasing domain by user
*/
func (ps *projectService) GetDomainPaymentLink(accountId, projectTag, domain string) (paymentLink string, err error) {
	dto := BuyDomainDto{
		AccountId:  accountId,
		ProjectTag: projectTag,
		DomainName: domain,
	}
	json_data, err := json.Marshal(dto)
	if err != nil {
		err = errors.New("bad input body")
		logrus.Error(err.Error())
		return
	}
	requestBody := bytes.NewBuffer(json_data)
	token, err := utils.GeneratToken()
	if err != nil {
		logrus.Error(err.Error())
		return
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
	url := config.Configs.Endpoints.Admin + "/internal/session/domain/create"
	out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		logrus.Error(err.Error())
		return
	}
	if status != http.StatusOK && status != http.StatusAccepted {
		logrus.Debug(string(out))
		err = errors.New("not ok with status: " + strconv.Itoa(status))
		logrus.Error(err.Error())
		return
	}
	var res struct {
		Url string `json:"url"`
	}
	if err := json.Unmarshal(out, &res); err != nil {
		logrus.Error(err.Error())
		return "", err
	}

	paymentLink = res.Url
	return
}

type BuyDomainDto struct {
	AccountId  string `json:"account_id" binding:"required"`
	DomainName string `json:"domain_name" binding:"required"`
	ProjectTag string `json:"project_tag" binding:"required"`
}
