// image: dotenx/task-and-trigger:open-ai-create-tweet-lambda2
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
	"time"

	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	Body           map[string]interface{} `json:"body"`
	ResultEndpoint string                 `json:"RESULT_ENDPOINT"`
	Authorization  string                 `json:"AUTHORIZATION"`
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
	apiKey := singleInput["INTEGRATION_API_KEY"].(string)
	explanation := fmt.Sprint(singleInput["explanation"])
	keywords := fmt.Sprint(singleInput["keywords"])

	// api reference: https://platform.openai.com/docs/api-reference/chat/create
	chatCompletionUrl := "https://api.openai.com/v1/chat/completions"
	chatCompletionHeaders := []Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", apiKey),
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	prompt := fmt.Sprintf("Write a tweet about the following content:\n%s\nThis tweet should be written based on SEO techniques and should be about these keywords: %s\nAnd also based on Twitter limitations the output should has at most 280 characters.", explanation, keywords)
	fmt.Println("Prompt:", prompt)
	chatCompletionBody := map[string]interface{}{
		"model": "gpt-3.5-turbo",
		"messages": []map[string]interface{}{
			{
				"role":    "user",
				"content": prompt,
			},
		},
	}
	chatCompletionBodyBytes, _ := json.Marshal(chatCompletionBody)
	out, statusCode, _, err := httpRequest(http.MethodPost, chatCompletionUrl, bytes.NewBuffer(chatCompletionBodyBytes), chatCompletionHeaders, 0)
	fmt.Println("Open AI api status code:", statusCode)
	fmt.Println("Open AI api response (send prompt):", string(out))
	if err != nil || (statusCode != http.StatusOK && statusCode != http.StatusCreated) {
		fmt.Printf("can't get correct response from Open AI api")
		resp.Successfull = false
	}
	if err != nil || statusCode != http.StatusOK {
		if err == nil {
			err = errors.New("request to Open AI api wasn't successful")
		}
		fmt.Println(err)
		resp.Successfull = false
	}

	var chatCompletionResponse struct {
		Id      string                   `json:"id"`
		Object  string                   `json:"object"`
		Model   string                   `json:"model"`
		Created int64                    `json:"created"`
		Usage   map[string]interface{}   `json:"usage"`
		Choices []map[string]interface{} `json:"choices"`
	}
	err = json.Unmarshal(out, &chatCompletionResponse)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}

	resp.ReturnValue = map[string]interface{}{
		"outputs": chatCompletionResponse,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Prompt was sent successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Prompt can't be sent successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
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
