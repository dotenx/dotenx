package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/slack-go/slack"
)

func main() {
	triggerName := os.Getenv("TRIGGER_NAME")
	workspace := os.Getenv("WORKSPACE")
	if triggerName == "" {
		log.Println("your trigger name is not set")
		return
	}
	access_token := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	channelId := os.Getenv("channel_id")
	passedSeconds := os.Getenv("passed_seconds")
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		log.Println(err.Error())
		return
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	pipelineEndpoint := os.Getenv("PIPELINE_ENDPOINT")
	api := slack.New(access_token)
	res, err := api.GetConversationHistory(&slack.GetConversationHistoryParameters{ChannelID: channelId})
	if err != nil {
		log.Println(err.Error())
		return
	}
	if len(res.Messages) > 0 {
		unixTime := strings.Split(res.Messages[0].Timestamp, ".")
		intUnixTime, err := strconv.Atoi(unixTime[0])
		if err != nil {
			log.Println(err.Error())
			return
		}
		if selectedUnix < int64(intUnixTime) {
			fmt.Println("calling endpoint")
			body := make(map[string]interface{})
			innerBody := make(map[string]interface{})
			body["workspace"] = workspace
			innerBody["text"] = res.Messages[0].Msg.Text
			innerBody["timestamp"] = res.Messages[0].Timestamp
			body[triggerName] = innerBody
			json_data, err := json.Marshal(body)
			if err != nil {
				log.Println(err)
				return
			}
			payload := bytes.NewBuffer(json_data)
			out, err, status := HttpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
			if err != nil {
				fmt.Println(err)
				fmt.Println(status)
				return
			}
			fmt.Println(string(out))
		} else {
			fmt.Println("no new message in channel")
		}
	} else {
		fmt.Println("no message in channel")
	}
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
