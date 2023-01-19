// image: hojjat12/gumroad-new-sale:lambda
package main

import (
	"bytes"
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
	pastSelectedTime := time.Now().Add(time.Duration(int64(-48)) * time.Hour)
	sales, err := listSales(accessToken, pastSelectedTime.Format("2006-01-02"))
	if err != nil {
		fmt.Println(err)
		return resp, err
	}

	targetSales := make([]map[string]interface{}, 0)
	for _, sale := range sales {
		createdTime, err := time.Parse(time.RFC3339, sale["created_at"].(string))
		if err != nil {
			fmt.Println(err)
			continue
		}
		if createdTime.Unix() >= selectedUnix {
			targetSales = append(targetSales, sale)
		}
	}
	if len(targetSales) == 0 {
		fmt.Println("no new sale in last", passedSeconds, "seconds")
		resp.Triggered = false
		return resp, nil
	}
	fmt.Println("sales:", targetSales)

	returnValue := make(map[string]interface{})
	returnValue["accountId"] = accId
	returnValue[triggerName] = targetSales
	resp.ReturnValue = returnValue
	resp.Triggered = true
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func listSales(accessToken, createdTime string) (sales []map[string]interface{}, err error) {
	listUrl := "https://api.gumroad.com/v2/sales"
	data := "after=" + createdTime
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", accessToken),
		},
	}
	body := bytes.NewBuffer([]byte(data))
	out, err, statusCode, _ := httpRequest(http.MethodGet, listUrl, body, headers, 0)
	if err != nil || statusCode != http.StatusOK {
		fmt.Println("Gumroad response (list sales):", string(out))
		fmt.Println("Gumroad status code:", statusCode)
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from Gumroad")
		}
		return
	}
	var resp struct {
		Success bool                     `json:"success"`
		Sales   []map[string]interface{} `json:"sales"`
	}
	err = json.Unmarshal(out, &resp)
	if err != nil {
		fmt.Println(err)
		return
	}
	if !resp.Success {
		err = errors.New("can't get correct response from Gumroad")
		return
	}
	sales = resp.Sales
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
