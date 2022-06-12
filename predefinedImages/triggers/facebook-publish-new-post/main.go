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
	"os"
	"strconv"
	"time"
)

type Post struct {
	CreatedTime string `json:"created_time"`
	Message     string `json:"message"`
	Id          string `json:"id"`
}

func main() {
	pipelineEndpoint := os.Getenv("PIPELINE_ENDPOINT")
	triggerName := os.Getenv("TRIGGER_NAME")
	accId := os.Getenv("ACCOUNT_ID")
	if triggerName == "" {
		fmt.Println("your trigger name is not set")
		return
	}
	accessToken := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	pageId := os.Getenv("page_id")
	passedSeconds := os.Getenv("passed_seconds")
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	posts, err := getPostsList(pageId, accessToken)
	if err != nil {
		fmt.Println(err)
		return
	}
	if len(posts) > 0 {
		lastPostUnix, err := time.Parse("2006-01-02T15:04:05-0700", posts[0].CreatedTime)
		if err != nil {
			fmt.Println(err)
			return
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
				return
			}
			payload := bytes.NewBuffer(json_data)
			out, err, status, _ := httpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
			if err != nil {
				fmt.Println("response:", string(out))
				fmt.Println("error:", err)
				fmt.Println("status code:", status)
				return
			}
			fmt.Println("trigger successfully started")
			return
		} else {
			fmt.Println("no new post in page")
			return
		}
	} else {
		fmt.Println("no post in page")
		return
	}

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
