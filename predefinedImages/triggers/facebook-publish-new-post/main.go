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
	PageId           string `json:"page_id"`
	PassedSeconds    string `json:"passed_seconds"`
}

type Response struct {
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	pipelineEndpoint := event.PipelineEndpoint
	triggerName := event.TriggerName
	accId := event.AccountId
	if triggerName == "" {
		fmt.Println("your trigger name is not set")
		return resp, errors.New("trigger name is not set")
	}
	accessToken := event.AccessToken
	pageId := event.PageId
	passedSeconds := event.PassedSeconds

	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	posts, err := getPostsList(pageId, accessToken)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	if len(posts) > 0 {
		lastPostUnix, err := time.Parse("2006-01-02T15:04:05-0700", posts[0].CreatedTime)
		if err != nil {
			fmt.Println(err)
			return resp, err
		}
		if lastPostUnix.Unix() > selectedUnix {
			body := make(map[string]interface{})
			body["accountId"] = accId
			innerBody := make(map[string]interface{})
			innerBody["created_time"] = lastPostUnix.String()
			innerBody["message"] = posts[0].Message
			innerBody["id"] = posts[0].Id
			body[triggerName] = innerBody
			json_data, err := json.Marshal(body)
			if err != nil {
				fmt.Println(err)
				return resp, err
			}
			payload := bytes.NewBuffer(json_data)
			out, err, status, _ := httpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
			if err != nil {
				fmt.Println("response:", string(out))
				fmt.Println("error:", err)
				fmt.Println("status code:", status)
				return resp, err
			}
			fmt.Println("trigger successfully started")
			return resp, nil
		} else {
			fmt.Println("no new post in page in last", passedSeconds, "seconds")
			return resp, nil
		}
	} else {
		fmt.Println("no post in page")
		return resp, nil
	}
}

type Post struct {
	CreatedTime string `json:"created_time"`
	Message     string `json:"message"`
	Id          string `json:"id"`
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func getPostsList(pageId, accessToken string) (posts []Post, err error) {
	url := "https://graph.facebook.com/" + pageId + "/feed?access_token=" + accessToken
	out, err, statusCode, _ := httpRequest(http.MethodGet, url, nil, nil, 0)
	if err != nil || statusCode != http.StatusOK {
		fmt.Println("facebook response (get posts list request):", string(out))
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from facebook")
		}
		return
	}
	var resp struct {
		Data []Post `json:"data"`
	}
	err = json.Unmarshal(out, &resp)
	if err != nil {
		fmt.Println(err)
		return
	}
	posts = resp.Data
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
