// image: hojjat12/ebay-new-order:lambda2
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
	startTime := time.Now().Add(-time.Second * time.Duration(seconds)).Format("2006-01-02T15:04:05.000Z")
	timeFilterString := fmt.Sprintf("[%s..]", startTime)
	// pipelineEndpoint := event.PipelineEndpoint

	orders, err := getOrdersList(accessToken, timeFilterString)
	if err != nil {
		log.Println(err.Error())
		return resp, err
	}
	innerBody := make(map[string]interface{})

	if len(orders) > 0 {
		for i, order := range orders {
			innerBody[fmt.Sprint(i)] = order
		}
	} else {
		fmt.Println("no new order exist (ebay)")
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

// func startAutomation(pipelineEndpoint, triggerName, accountId, workspace string, innerBody map[string]interface{}) (statusCode int, err error) {
// 	body := make(map[string]interface{})
// 	body["accountId"] = accountId
// 	body["workspace"] = workspace
// 	body[triggerName] = innerBody
// 	json_data, err := json.Marshal(body)
// 	if err != nil {
// 		fmt.Println(err)
// 		return 0, err
// 	}
// 	fmt.Println("final body:", string(json_data))
// 	payload := bytes.NewBuffer(json_data)
// 	out, err, status := HttpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
// 	if err != nil || status != http.StatusOK {
// 		fmt.Println("response:", string(out))
// 		fmt.Println("error:", err)
// 		fmt.Println("status code:", status)
// 		if err == nil {
// 			err = errors.New("can't get correct response from dotenx api")
// 		}
// 		return 0, err
// 	}
// 	fmt.Println("trigger successfully started")
// 	return status, nil
// }

func getOrdersList(accessToken, filter string) (orders []interface{}, err error) {
	url := "https://api.ebay.com/sell/fulfillment/v1/order?limit=100&filter=creationdate:" + filter
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "Accept",
			Value: "application/json",
		},
		{
			Key:   "Authorization",
			Value: "Bearer " + accessToken,
		},
	}
	out, err, statusCode := HttpRequest(http.MethodGet, url, nil, headers, 0)
	log.Println("ebay response (get orders list request):", string(out))
	if err != nil || statusCode != http.StatusOK {
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from ebay")
		}
		return
	}
	var resp struct {
		Href   string        `json:"href"`
		Total  int           `json:"total"`
		Next   string        `json:"next"`
		Orders []interface{} `json:"orders"`
	}
	err = json.Unmarshal(out, &resp)
	if err != nil {
		log.Println(err)
		return
	}
	orders = resp.Orders
	return
}

type Header struct {
	Key   string
	Value string
}

func HttpRequest(method string, url string, body io.Reader, headers []Header, timeout time.Duration) (out []byte, err error, statusCode int) {

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
	return
}
