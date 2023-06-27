// image: dotenx/task-and-trigger:medium-create-story-lambda2
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
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	Body map[string]interface{} `json:"body"`
}

type Response struct {
	Successfull bool                   `json:"successfull"`
	Status      string                 `json:"status"`
	ReturnValue map[string]interface{} `json:"return_value"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resp.Successfull = true
	singleInput := event.Body
	accessToken := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
	title := fmt.Sprint(singleInput["title"])
	format := fmt.Sprint(singleInput["format"])
	content := fmt.Sprint(singleInput["content"])
	tags := fmt.Sprint(singleInput["tags"])
	canonicalUrl := fmt.Sprint(singleInput["canonical_url"])
	publishStatus := fmt.Sprint(singleInput["publish_status"])
	notifyFollowersStr := fmt.Sprint(singleInput["notify_followers"])

	if publishStatus == "" {
		publishStatus = "public"
	}

	var notifyFollowers = true
	if strings.ToLower(notifyFollowersStr) == "no" {
		notifyFollowers = false
	} else if notifyFollowersStr != "" && strings.ToLower(notifyFollowersStr) != "yes" {
		fmt.Println("invalid value for notify_followers field, the value of this filed should be 'yes' or 'no'")
		resp.Successfull = false
		resp.Status = "failed"
		return resp, nil
	}

	response, err := createStory(accessToken, title, format, content, tags, canonicalUrl, publishStatus, notifyFollowers)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}

	resp.ReturnValue = map[string]interface{}{
		"outputs": response,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("The story successfully created")
	} else {
		resp.Status = "failed"
		fmt.Println("Creating story wasn't successful")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

// based on this api document: https://github.com/Medium/medium-api-docs#creating-a-post
func createStory(accessToken, title, format, content, tags, canonicalUrl, publishStatus string, notifyFollowers bool) (resp map[string]interface{}, err error) {
	url := "https://api.medium.com/v1/me"
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "Authorization",
			Value: "Bearer " + accessToken,
		},
	}
	out, status, _, err := httpRequest(http.MethodGet, url, nil, headers, time.Minute)
	log.Println("medium response (get profile):", string(out))
	if err != nil {
		return nil, err
	}
	if status != http.StatusOK {
		return nil, errors.New("not ok with status " + fmt.Sprint(status))
	}
	var profile map[string]interface{}
	json.Unmarshal(out, &profile)
	profile = profile["data"].(map[string]interface{})
	userId := fmt.Sprint(profile["id"])

	url = fmt.Sprintf("https://api.medium.com/v1/users/%s/posts", userId)
	body := map[string]interface{}{
		"title":           title,
		"contentFormat":   format,
		"content":         content,
		"publishStatus":   publishStatus,
		"notifyFollowers": notifyFollowers,
	}
	if canonicalUrl != "" {
		body["canonicalUrl"] = canonicalUrl
	}
	if tags != "" {
		body["tags"] = strings.Split(tags, ",")
	}
	bodyBytes, _ := json.Marshal(body)
	out, status, _, err = httpRequest(http.MethodPost, url, bytes.NewBuffer(bodyBytes), headers, time.Minute)
	log.Println("medium response (create story):", string(out))
	if err != nil {
		return nil, err
	}
	if status != http.StatusOK {
		return nil, errors.New("not ok with status " + fmt.Sprint(status))
	}
	err = json.Unmarshal(out, &resp)

	return
}

func httpRequest(method string, url string, body io.Reader, headers []Header, timeout time.Duration) (out []byte, statusCode int, header *http.Header, err error) {

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
