package oauthController

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func getSlackAccessToken(clientId, clientSecret, code, redirectUrl string) (string, error) {
	var dto struct {
		AccessToken string `json:"access_token"`
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
	if err != nil {
		return "", err
	}
	if status != http.StatusOK {
		return "", fmt.Errorf("not ok with status: %d", status)
	}
	err = json.Unmarshal(out, &dto)
	return dto.AccessToken, err
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
	if err != nil {
		return "", err
	}
	if status != http.StatusOK {
		return "", fmt.Errorf("not ok with status: %d", status)
	}
	err = json.Unmarshal(out, &refreshDto)
	return refreshDto.AccessToken, err
}

func getTypeformAccessToken(clientId, clientSecret, code, redirectUrl string) (string, error) {
	var dto struct {
		AccessToken string `json:"access_token"`
	}
	data := "client_id=" + clientId
	data += "&client_secret=" + clientSecret
	data += "&code=" + code
	data += "&grant_type=authorization_code"
	data += "&redirect_uri=" + redirectUrl
	url := "https://api.typeform.com/oauth/token"
	headers := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
	}
	body := bytes.NewBuffer([]byte(data))
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodPost, url, body, headers, time.Minute, true)
	log.Println("typeform response:", string(out))
	if err != nil {
		return "", err
	}
	if status != 200 {
		return "", errors.New("not ok with status " + fmt.Sprint(status))
	}
	err = json.Unmarshal(out, &dto)
	return dto.AccessToken, err
}

func getEbayTokens(clientId, clientSecret, code, redirectUrl string) (accessToken, refreshToken string, err error) {
	var dto struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	data := "code=" + code
	data += "&grant_type=authorization_code"
	data += "&redirect_uri=" + redirectUrl
	url := "https://api.ebay.com/identity/v1/oauth2/token"
	headers := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
		{
			Key:   "Authorization",
			Value: "Basic " + base64.StdEncoding.EncodeToString([]byte(clientId+":"+clientSecret)),
		},
	}
	body := bytes.NewBuffer([]byte(data))
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodPost, url, body, headers, time.Minute, true)
	log.Println("ebay response:", string(out))
	if err != nil {
		return "", "", err
	}
	if status != 200 {
		return "", "", errors.New("not ok with status " + fmt.Sprint(status))
	}
	err = json.Unmarshal(out, &dto)
	return dto.AccessToken, dto.RefreshToken, err
}

func getMailchimpAccessToken(clientId, clientSecret, code, redirectUrl string) (string, error) {
	var dto struct {
		AccessToken string `json:"access_token"`
	}
	data := "client_id=" + clientId
	data += "&client_secret=" + clientSecret
	data += "&grant_type=authorization_code"
	data += "&redirect_uri=" + redirectUrl
	data += "&code=" + code
	url := "https://login.mailchimp.com/oauth2/token"
	headers := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
	}
	body := bytes.NewBuffer([]byte(data))
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodPost, url, body, headers, time.Minute, true)
	log.Println("mailchimp response:", string(out))
	if err != nil {
		return "", err
	}
	if status != 200 {
		return "", errors.New("not ok with status " + fmt.Sprint(status))
	}
	err = json.Unmarshal(out, &dto)
	return dto.AccessToken, err
}

func (controller *OauthController) getAirtableTokens(clientId, clientSecret, code, state, redirectUrl string) (accessToken, refreshToken string, err error) {
	exist, codeVerifier, err := controller.Service.GetRedisPairValue(state)
	if err != nil {
		return "", "", err
	}
	if !exist {
		return "", "", errors.New("code challenge was expired or state is invalid")
	}
	var dto struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	data := "code=" + code
	data += "&grant_type=authorization_code"
	data += "&code_verifier=" + codeVerifier
	data += "&redirect_uri=" + redirectUrl
	url := "https://airtable.com/oauth2/v1/token"
	headers := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
		{
			Key:   "Authorization",
			Value: "Basic " + base64.StdEncoding.EncodeToString([]byte(clientId+":"+clientSecret)),
		},
	}
	body := bytes.NewBuffer([]byte(data))
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodPost, url, body, headers, time.Minute, true)
	logrus.Info("airtable response:", string(out))

	if err != nil {
		return "", "", err
	}
	if status != http.StatusOK && status != http.StatusCreated {
		return "", "", errors.New("not ok with status " + fmt.Sprint(status))
	}
	err = json.Unmarshal(out, &dto)
	return dto.AccessToken, dto.RefreshToken, err
}

func getGumroadTokens(clientId, clientSecret, code, redirectUrl string) (accessToken, refreshToken string, err error) {
	var dto struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	data := "code=" + code
	data += "&grant_type=authorization_code"
	data += "&client_id=" + clientId
	data += "&client_secret=" + clientSecret
	data += "&redirect_uri=" + redirectUrl
	url := "https://api.gumroad.com/oauth/token"
	headers := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
	}
	body := bytes.NewBuffer([]byte(data))
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodPost, url, body, headers, time.Minute, true)
	log.Println("gumroad response:", string(out))
	if err != nil {
		return "", "", err
	}
	if status != 200 {
		return "", "", errors.New("not ok with status " + fmt.Sprint(status))
	}
	err = json.Unmarshal(out, &dto)
	return dto.AccessToken, dto.RefreshToken, err
}

func getHubspotTokens(clientId, clientSecret, code, redirectUrl string) (accessToken, refreshToken string, err error) {
	var dto struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	data := "code=" + code
	data += "&grant_type=authorization_code"
	data += "&client_id=" + clientId
	data += "&client_secret=" + clientSecret
	data += "&redirect_uri=" + redirectUrl
	url := "https://api.hubapi.com/oauth/v1/token"
	headers := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
	}
	body := bytes.NewBuffer([]byte(data))
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodPost, url, body, headers, time.Minute, true)
	log.Println("hubspot response:", string(out))
	if err != nil {
		return "", "", err
	}
	if status != 200 {
		return "", "", errors.New("not ok with status " + fmt.Sprint(status))
	}
	err = json.Unmarshal(out, &dto)
	return dto.AccessToken, dto.RefreshToken, err
}
