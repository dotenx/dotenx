// image: hojjat12/hubspot-new-email-event:lambda
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
	EventType        string `json:"event_type"`
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
	eventType := event.EventType
	passedSeconds := event.PassedSeconds

	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}
	selectedTime := time.Now().Add(time.Duration(int64(-seconds)) * time.Second)
	selectedUnix := selectedTime.Unix()

	emailEvents, err := listEmailEvents(accessToken, eventType, selectedUnix)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	if len(emailEvents) == 0 {
		fmt.Println("no new email event in last", passedSeconds, "seconds")
		resp.Triggered = false
		return resp, nil
	}
	fmt.Println("emailEvents:", emailEvents)

	returnValue := make(map[string]interface{})
	returnValue["accountId"] = accId
	returnValue[triggerName] = emailEvents
	resp.ReturnValue = returnValue
	resp.Triggered = true
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func listEmailEvents(accessToken, eventType string, afterUnix int64) (events []map[string]interface{}, err error) {
	nextLink := fmt.Sprintf("https://api.hubapi.com/email/public/v1/events?eventType=%s&limit=1000", eventType)
	const MAX_PAGE_NUMBER = 5
	for i := 0; i < MAX_PAGE_NUMBER; i++ {
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
			fmt.Println("HubSpot response (list email event):", string(out))
			fmt.Println("HubSpot status code:", statusCode)
			if statusCode != http.StatusOK {
				err = errors.New("can't get correct response from HubSpot")
			}
			return nil, err
		}
		var resp struct {
			HasMore bool                     `json:"hasMore"`
			Offset  string                   `json:"offset"`
			Events  []map[string]interface{} `json:"events"`
		}
		err = json.Unmarshal(out, &resp)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		for _, event := range resp.Events {
			createdTime := int64(event["created"].(float64) / 1000)
			if createdTime >= afterUnix {
				events = append(events, event)
			}
		}
		if !resp.HasMore {
			break
		}
		nextLinkOffset := resp.Offset
		nextLink = fmt.Sprintf("https://api.hubapi.com/email/public/v1/events?eventType=%s&offset=%s&limit=1000", eventType, nextLinkOffset)
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
