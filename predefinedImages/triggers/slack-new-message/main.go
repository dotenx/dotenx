package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/slack-go/slack"
)

type Event struct {
	PipelineEndpoint string `json:"PIPELINE_ENDPOINT"`
	TriggerName      string `json:"TRIGGER_NAME"`
	AccountId        string `json:"ACCOUNT_ID"`
	Workspace        string `json:"WORKSPACE"`
	AccessToken      string `json:"INTEGRATION_ACCESS_TOKEN"`
	ChannelId        string `json:"channel_id"`
	PassedSeconds    string `json:"passed_seconds"`
}

type Response struct {
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
	access_token := event.AccessToken
	channelId := event.ChannelId
	passedSeconds := event.PassedSeconds
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		log.Println(err.Error())
		return resp, err
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	pipelineEndpoint := event.PipelineEndpoint

	api := slack.New(access_token)
	res, err := api.GetConversationHistory(&slack.GetConversationHistoryParameters{ChannelID: channelId})
	if err != nil {
		log.Println(err.Error())
		return resp, err
	}
	if len(res.Messages) > 0 {
		unixTime := strings.Split(res.Messages[0].Timestamp, ".")
		intUnixTime, err := strconv.Atoi(unixTime[0])
		if err != nil {
			log.Println(err.Error())
			return resp, err
		}
		if selectedUnix < int64(intUnixTime) {
			fmt.Println("calling endpoint")
			body := make(map[string]interface{})
			body["accountId"] = accId
			innerBody := make(map[string]interface{})
			body["workspace"] = workspace
			innerBody["text"] = res.Messages[0].Msg.Text
			innerBody["timestamp"] = res.Messages[0].Timestamp
			body[triggerName] = innerBody
			json_data, err := json.Marshal(body)
			if err != nil {
				log.Println(err)
				return resp, err
			}
			payload := bytes.NewBuffer(json_data)
			out, err, status := HttpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
			if err != nil {
				fmt.Println(err)
				fmt.Println(status)
				return resp, err
			}
			fmt.Println(string(out))
			fmt.Println("trigger successfully started")
			return resp, nil
		} else {
			fmt.Println("no new message in channel")
			return resp, nil
		}
	} else {
		fmt.Println("no message in channel")
		return resp, nil
	}
}

func main() {
	lambda.Start(HandleLambdaEvent)
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
