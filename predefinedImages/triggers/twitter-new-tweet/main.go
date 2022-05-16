package main

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/dghubble/oauth1"
)

func main() {
	pipelineEndpoint := os.Getenv("PIPELINE_ENDPOINT")
	triggerName := os.Getenv("TRIGGER_NAME")
	accId := os.Getenv("ACCOUNT_ID")
	consumerKey := os.Getenv("INTEGRATION_CONSUMER_KEY")
	consumerSecret := os.Getenv("INTEGRATION_CONSUMER_SECRET")
	accessToken := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	accessTokenSecret := os.Getenv("INTEGRATION_ACCESS_TOKEN_SECRET")
	userName := os.Getenv("username")
	passedSeconds := os.Getenv("passed_seconds")
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		log.Println(err.Error())
		return
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	tweets, err := getTweets(userName, consumerKey, consumerSecret, accessToken, accessTokenSecret)
	if err != nil {
		log.Println(err)
		return
	}
	if len(tweets) > 0 {
		createdTime, _ := tweets[0].CreatedAtTime()
		if createdTime.Unix() > selectedUnix {
			body := make(map[string]interface{})
			body["accountId"] = accId
			innerBody := make(map[string]interface{})
			innerBody["created_at"] = createdTime.String()
			innerBody["text"] = tweets[0].Text
			body[triggerName] = innerBody
			json_data, err := json.Marshal(body)
			if err != nil {
				log.Println(err)
				return
			}
			payload := bytes.NewBuffer(json_data)
			out, err, status, _ := httpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
			if err != nil {
				log.Println("response:", string(out))
				log.Println("error:", err)
				log.Println("status code:", status)
				return
			}
			log.Println("trigger successfully started")
			return
		} else {
			log.Println("no new tweet found in last", passedSeconds, "seconds")
			return
		}
	} else {
		log.Println("no new tweet found")
		return
	}

}

// get tweets timeline based on this repo: https://github.com/dghubble/go-twitter
func getTweets(userName, consumerKey, consumerSecret, accessToken, accessTokenSecret string) (tweets []twitter.Tweet, err error) {
	config := oauth1.NewConfig(consumerKey, consumerSecret)
	token := oauth1.NewToken(accessToken, accessTokenSecret)
	httpClient := config.Client(oauth1.NoContext, token)
	client := twitter.NewClient(httpClient)

	tweets, _, err = client.Timelines.UserTimeline(&twitter.UserTimelineParams{
		ScreenName: userName,
	})
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
