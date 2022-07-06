package oauthController

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func getSlackAccessToken(clientId, clientSecret, code, redirectUrl string) (string, error) {
	var dto struct {
		AccessToekn string `json:"access_token"`
	}
	data := "client_id=" + clientId
	data += "&client_secret=" + clientSecret
	data += "&code=" + code
	data += "&redirect_uri=" + redirectUrl
	url := "https://slack.com/api/oauth.v2.access"
	headers := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
	}
	body := bytes.NewBuffer([]byte(data))
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodPost, url, body, headers, time.Minute, true)
	log.Println("slack response:", string(out))
	log.Println("-----------------------------------------------------------")
	if err != nil {
		return "", err
	}
	if status != http.StatusOK {
		return "", fmt.Errorf("not ok with status: %d", status)
	}
	err = json.Unmarshal(out, &dto)
	return dto.AccessToekn, err
}

func getInstagramAccessToken(clientId, clientSecret, code, redirectUrl string) (string, error) {
	var dto struct {
		AccessToken string `json:"access_token"`
	}
	data := "client_id=" + clientId
	data += "&client_secret=" + clientSecret
	data += "&code=" + code
	data += "&grant_type=authorization_code"
	data += "&redirect_uri=" + redirectUrl
	url := "https://api.instagram.com/oauth/access_token"
	headers := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
	}
	body := bytes.NewBuffer([]byte(data))
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodPost, url, body, headers, time.Minute, true)
	log.Println("instagram response:", string(out))
	log.Println("-----------------------------------------------------------")
	if err != nil {
		return "", err
	}
	if status != http.StatusOK {
		return "", fmt.Errorf("not ok with status: %d", status)
	}
	err = json.Unmarshal(out, &dto)
	if err != nil {
		return "", err
	}

	var refreshDto struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		ExpiresIn   int    `json:"expires_in"`
	}

	refreshUrl := "https://graph.instagram.com/access_token"
	refreshUrl += "?grant_type=ig_exchange_token"
	refreshUrl += "&client_secret=" + clientSecret
	refreshUrl += "&access_token=" + dto.AccessToken

	out, err, status, _ = helper.HttpRequest(http.MethodGet, refreshUrl, nil, nil, time.Minute, true)
	log.Println("instagram response:", string(out))
	log.Println("-----------------------------------------------------------")
	if err != nil {
		return "", err
	}
	if status != http.StatusOK {
		return "", fmt.Errorf("not ok with status: %d", status)
	}
	err = json.Unmarshal(out, &refreshDto)
	return refreshDto.AccessToken, err
}
