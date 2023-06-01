// image: hojjat12/hubspot-new-contact:lambda
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	PipelineEndpoint string `json:"PIPELINE_ENDPOINT"`
	TriggerName      string `json:"TRIGGER_NAME"`
	AccountId        string `json:"ACCOUNT_ID"`
	AccessToken      string `json:"INTEGRATION_ACCESS_TOKEN"`
	PassedSeconds    string `json:"passed_seconds"`
}

type Response struct {
	Triggered   bool                   `json:"triggered"`
	ReturnValue map[string]interface{} `json:"return_value"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	// pipelineEndpoint := event.PipelineEndpoint
	triggerName := event.TriggerName
	accId := event.AccountId
	if triggerName == "" {
		fmt.Println("your trigger name is not set")
		return resp, errors.New("trigger name is not set")
	}
	accessToken := event.AccessToken
	passedSeconds := event.PassedSeconds

	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}
	selectedTime := time.Now().Add(time.Duration(int64(-seconds)) * time.Second)
	selectedUnix := selectedTime.Unix()

	contacts, err := listContacts(accessToken, selectedUnix)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	if len(contacts) == 0 {
		fmt.Println("no new contact in last", passedSeconds, "seconds")
		resp.Triggered = false
		return resp, nil
	}
	fmt.Println("contacts:", contacts)

	returnValue := make(map[string]interface{})
	returnValue["accountId"] = accId
	returnValue[triggerName] = contacts
	resp.ReturnValue = returnValue
	resp.Triggered = true
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func listContacts(accessToken string, afterUnix int64) (contacts []map[string]interface{}, err error) {
	nextLink := "https://api.hubapi.com/crm/v3/objects/contacts?limit=100"
	for {
		headers := []Header{
			{
				Key:   "Content-Type",
				Value: "application/json",
			},
			{
				Key:   "Authorization",
				Value: fmt.Sprintf("Bearer %s", accessToken),
			},
		}
		out, err, statusCode, _ := httpRequest(http.MethodGet, nextLink, nil, headers, 0)
		if err != nil || statusCode != http.StatusOK {
			fmt.Println("HubSpot response (list contacts):", string(out))
			fmt.Println("HubSpot status code:", statusCode)
			if statusCode != http.StatusOK {
				err = errors.New("can't get correct response from HubSpot")
			}
			return nil, err
		}
		var resp struct {
			Paging  map[string]interface{}   `json:"paging"`
			Results []map[string]interface{} `json:"results"`
		}
		err = json.Unmarshal(out, &resp)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		for _, contact := range resp.Results {
			createdTime, err := time.Parse(time.RFC3339, contact["createdAt"].(string))
			if err != nil {
				fmt.Println(err)
				return nil, err
			}
			if createdTime.Unix() >= afterUnix {
				contacts = append(contacts, contact)
			}
		}
		if resp.Paging == nil {
			break
		}
		nextLink = resp.Paging["next"].(map[string]interface{})["link"].(string)
	}
	return
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
