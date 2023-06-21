// image: dotenx/task-and-trigger:open-ai-send-prompt-lambda
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
	model := fmt.Sprint(singleInput["model"])
	prompt := fmt.Sprint(singleInput["prompt"])
	temperatureStr := fmt.Sprint(singleInput["temperature"])
	temperature, err := strconv.ParseFloat(temperatureStr, 64)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}
	maxLengthStr := fmt.Sprint(singleInput["max_length"])
	maxLength, _ := strconv.Atoi(maxLengthStr)
	// ignore error because maxLength isn't an important parameter
	stopSequences := fmt.Sprint(singleInput["stop_sequences"])
	topPStr := fmt.Sprint(singleInput["top_p"])
	topP, err := strconv.ParseFloat(topPStr, 64)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}
	frequencyPenaltyStr := fmt.Sprint(singleInput["frequency_penalty"])
	frequencyPenalty, err := strconv.ParseFloat(frequencyPenaltyStr, 64)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}
	presencePenaltyStr := fmt.Sprint(singleInput["presence_penalty"])
	presencePenalty, err := strconv.ParseFloat(presencePenaltyStr, 64)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}

	// api reference: https://platform.openai.com/docs/api-reference/completions/create
	chatCompletionUrl := "https://api.openai.com/v1/completions"
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
	chatCompletionBody := map[string]interface{}{
		"model":             model,
		"prompt":            prompt,
		"temperature":       temperature,
		"top_p":             topP,
		"presence_penalty":  presencePenalty,
		"frequency_penalty": frequencyPenalty,
	}
	if maxLength != 0 {
		chatCompletionBody["max_tokens"] = maxLength
	}
	if stopSequences != "" {
		chatCompletionBody["stop"] = stopSequences
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
