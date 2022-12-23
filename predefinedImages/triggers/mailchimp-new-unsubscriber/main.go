// image: hojjat12/mailchimp-new-unsubscriber:lambda
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	PipelineEndpoint string `json:"PIPELINE_ENDPOINT"`
	TriggerName      string `json:"TRIGGER_NAME"`
	AccountId        string `json:"ACCOUNT_ID"`
	Workspace        string `json:"WORKSPACE"`
	AccessToken      string `json:"INTEGRATION_ACCESS_TOKEN"`
	PassedSeconds    string `json:"passed_seconds"`
	ListId           string `json:"list_id"`
}

type Response struct {
	Triggered   bool                   `json:"triggered"`
	ReturnValue map[string]interface{} `json:"return_value"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	triggerName := event.TriggerName
	workspace := event.Workspace
	accId := event.AccountId
	if triggerName == "" {
		log.Println("your trigger name is not set")
		return resp, errors.New("trigger name is not set")
	}
	accessToken := event.AccessToken
	passedSeconds := event.PassedSeconds
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		log.Println(err.Error())
		return resp, err
	}
	timeFilterString := time.Now().Add(-time.Second * time.Duration(seconds)).Format("2006-01-02T15:04:05-07:00")
	listId := event.ListId

	apiEndpoint, err := getApiEndpointOfMailchimpAccount(accessToken)
	if err != nil {
		log.Println(err.Error())
		return resp, err
	}
	members, err := getSubscriberList(apiEndpoint, accessToken, listId, timeFilterString)
	if err != nil {
		log.Println(err.Error())
		return resp, err
	}

	innerBody := make([]map[string]interface{}, 0)
	if len(members) > 0 {
		for _, member := range members {
			innerBody = append(innerBody, member.(map[string]interface{}))
		}
	} else {
		fmt.Println("no new member exist (mailchimp)")
		resp.Triggered = false
		return resp, nil
	}

	fmt.Println("innerBody:", innerBody)
	returnValue := make(map[string]interface{})
	returnValue["accountId"] = accId
	returnValue["workspace"] = workspace
	returnValue[triggerName] = innerBody
	resp.ReturnValue = returnValue
	resp.Triggered = true
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

// based on this api document: https://mailchimp.com/developer/marketing/api/list-members/list-members-info
func getSubscriberList(apiEndpoint, accessToken, listId, dateAdded string) (members []interface{}, err error) {
	url := apiEndpoint + "/3.0/lists/" + listId + "/members"
	url += "?since_timestamp_opt=" + dateAdded
	url += "&count=1000"
	url += "&status=archived"
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "Authorization",
			Value: "Bearer " + accessToken,
		},
	}
	out, err, status, _ := httpRequest(http.MethodGet, url, nil, headers, time.Minute)
	if err != nil {
		return nil, err
	}
	if status != http.StatusOK {
		return nil, errors.New("not ok with status " + fmt.Sprint(status))
	}
	var resp struct {
		Links   interface{}   `json:"_links"`
		Total   int           `json:"total_items"`
		Members []interface{} `json:"members"`
	}
	err = json.Unmarshal(out, &resp)
	if err != nil {
		log.Println(err)
		return
	}
	members = resp.Members
	return
}

func getApiEndpointOfMailchimpAccount(accessToken string) (string, error) {
	var dto struct {
		Dc          string                 `json:"dc"`
		UserId      int64                  `json:"user_id"`
		Login       map[string]interface{} `json:"login"`
		ApiEndpoint string                 `json:"api_endpoint"`
	}
	url := "https://login.mailchimp.com/oauth2/metadata"
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "Authorization",
			Value: "OAuth " + accessToken,
		},
	}
	out, err, status, _ := httpRequest(http.MethodGet, url, nil, headers, time.Minute)
	fmt.Println("output response:", string(out))
	if err != nil {
		return "", err
	}
	if status != 200 {
		return "", errors.New("not ok with status " + fmt.Sprint(status))
	}
	err = json.Unmarshal(out, &dto)
	return dto.ApiEndpoint, err
}

func httpRequest(method string, url string, body io.Reader, headers []Header, timeout time.Duration) (out []byte, err error, statusCode int, header *http.Header) {

	var req *http.Request
	if timeout > 0 {
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel()
		req, err = http.NewRequestWithContext(ctx, method, url, body)
	} else {
		req, err = http.NewRequest(method, url, body)
	}
	if err != nil {
		return
	}

	for _, header := range headers {
		req.Header.Add(header.Key, header.Value)
	}

	c := &http.Client{}
	res, err := c.Do(req)
	if err != nil {
		return
	}
	defer res.Body.Close()

	statusCode = res.StatusCode
	out, err = ioutil.ReadAll(res.Body)
	header = &res.Header
	return
}

type Header struct {
	Key   string
	Value string
}
