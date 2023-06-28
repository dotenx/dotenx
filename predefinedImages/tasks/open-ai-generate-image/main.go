// image: dotenx/task-and-trigger:open-ai-generate-image-lambda
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
	size := fmt.Sprint(singleInput["size"])
	prompt := fmt.Sprint(singleInput["prompt"])
	numberOfImagestr := fmt.Sprint(singleInput["number_of_image"])
	numberOfImage, err := strconv.Atoi(numberOfImagestr)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}

	// api reference: https://platform.openai.com/docs/api-reference/images/create
	imageCreationUrl := "https://api.openai.com/v1/images/generations"
	imageCreationHeaders := []Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", apiKey),
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	imageCreationBodyBytes, _ := json.Marshal(map[string]interface{}{
		"prompt": prompt,
		"size":   size,
		"n":      numberOfImage,
	})
	out, statusCode, _, err := httpRequest(http.MethodPost, imageCreationUrl, bytes.NewBuffer(imageCreationBodyBytes), imageCreationHeaders, 0)
	fmt.Println("Open AI api status code:", statusCode)
	fmt.Println("Open AI api response (generate image):", string(out))
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

	var imageCreationResponse struct {
		Created int64                    `json:"created"`
		Data    []map[string]interface{} `json:"data"`
	}
	err = json.Unmarshal(out, &imageCreationResponse)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}

	resp.ReturnValue = map[string]interface{}{
		"outputs": imageCreationResponse,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Image generation was successful")
	} else {
		resp.Status = "failed"
		fmt.Println("Image generation wasn't successful")
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
