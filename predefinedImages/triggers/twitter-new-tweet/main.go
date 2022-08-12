// image: hojjat12/twitter-new-tweet:lambda3
package main

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/dghubble/go-twitter/twitter"
	"github.com/dghubble/oauth1"
)

type Event struct {
	PipelineEndpoint  string `json:"PIPELINE_ENDPOINT"`
	TriggerName       string `json:"TRIGGER_NAME"`
	AccountId         string `json:"ACCOUNT_ID"`
	ConsumerKey       string `json:"INTEGRATION_CONSUMER_KEY"`
	ConsumerSecret    string `json:"INTEGRATION_CONSUMER_SECRET"`
	AccessToken       string `json:"INTEGRATION_ACCESS_TOKEN"`
	AccessTokenSecret string `json:"INTEGRATION_ACCESS_TOKEN_SECRET"`
	Username          string `json:"username"`
	PassedSeconds     string `json:"passed_seconds"`
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
	consumerKey := event.ConsumerKey
	consumerSecret := event.ConsumerSecret
	accessToken := event.AccessToken
	accessTokenSecret := event.AccessTokenSecret
	userName := event.Username
	passedSeconds := event.PassedSeconds
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	tweets, err := getTweets(userName, consumerKey, consumerSecret, accessToken, accessTokenSecret)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	targetTweets := make([]twitter.Tweet, 0)
	innerBody := make(map[string]interface{})

	if len(tweets) > 0 {
		for _, tweet := range tweets {
			createdTime, _ := tweet.CreatedAtTime()
			if createdTime.Unix() > selectedUnix {
				targetTweets = append(targetTweets, tweet)
				// return resp, nil
			} // else {
			// 	fmt.Println("no new tweet found in last", passedSeconds, "seconds")
			// 	return resp, nil
			// }
		}
	} else {
		fmt.Println("no new tweet found")
		resp.Triggered = false
		return resp, nil
	}
	if len(targetTweets) == 0 {
		fmt.Println("no new tweet found")
		resp.Triggered = false
		return resp, nil
	}
	for i, tweet := range targetTweets {
		output := make(map[string]interface{})
		output["created_at"] = tweet.CreatedAt
		output["text"] = tweet.Text
		innerBody[fmt.Sprint(i)] = output
	}
	fmt.Println("innerBody:", innerBody)
	returnValue := make(map[string]interface{})
	returnValue["accountId"] = accId
	returnValue[triggerName] = innerBody
	resp.ReturnValue = returnValue
	resp.Triggered = true
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

// func startAutomation(pipelineEndpoint, triggerName, accountId string, innerBody map[string]interface{}) (statusCode int, err error) {
// 	body := make(map[string]interface{})
// 	body["accountId"] = accountId
// 	body[triggerName] = innerBody
// 	json_data, err := json.Marshal(body)
// 	if err != nil {
// 		fmt.Println(err)
// 		return 0, err
// 	}
// 	fmt.Println("final body:", string(json_data))
// 	payload := bytes.NewBuffer(json_data)
// 	out, err, status, _ := httpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
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
