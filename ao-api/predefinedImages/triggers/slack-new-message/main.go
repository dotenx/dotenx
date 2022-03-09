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
	"time"

	"github.com/slack-go/slack"
)

func main() {
	access_token := os.Getenv("CREDENTIAL_ACCESS_TOKEN")
	channelId := os.Getenv("channel_id")
	pipelineEndpoint := os.Getenv("PIPELINE_ENDPOINT")
	log.Println("tssssss")
	api := slack.New(access_token)
	//now := time.Now()
	//sec := now.Unix() - 600
	res, err := api.GetConversationHistory(&slack.GetConversationHistoryParameters{ChannelID: channelId /*, Inclusive: true, Oldest: string(sec)*/})
	if err != nil {
		log.Println(err.Error())
		time.Sleep(time.Duration(5) * time.Minute)
		return
	}
	if len(res.Messages) > 0 {
		fmt.Println("calling endpoint")
		body := make(map[string]interface{})
		innerBody := make(map[string]interface{})
		innerBody["text"] = res.Messages[0].Msg.Text
		body["trigger"] = innerBody
		json_data, err := json.Marshal(body)
		if err != nil {
			log.Println(err)
			time.Sleep(time.Duration(5) * time.Minute)
			return
		}
		payload := bytes.NewBuffer(json_data)
		out, err, status := HttpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
		fmt.Println(string(out))
		fmt.Println(err)
		fmt.Println(status)
		time.Sleep(time.Duration(5) * time.Minute)
	} else {
		fmt.Println("no message in channel")
		time.Sleep(time.Duration(5) * time.Minute)
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
