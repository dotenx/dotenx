package main

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"github.com/slack-go/slack"
)

func main() {
	access_token := os.Getenv("CREDENTIAL_ACCESS_TOKEN")
	channelId := os.Getenv("channel_id")
	pipelineEndpoint := os.Getenv("PIPELINE_ENDPOINT")
	api := slack.New(access_token)
	// {"channel_id": }
	//log.Println("slack step0 done")
	//now := time.Now()
	//sec := now.Unix() - 600
	res, err := api.GetConversationHistory(&slack.GetConversationHistoryParameters{ChannelID: channelId /*, Inclusive: true, Oldest: string(sec)*/})
	if err != nil {
		fmt.Println(err)
		return
	}
	if len(res.Messages) > 0 {
		_, _, _ = HttpRequest(http.MethodPost, pipelineEndpoint, nil, nil, 0)
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
