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
	Method         string `json:"method"`
	Url            string `json:"url"`
	Body           string `json:"body"`
	ResultEndpoint string `json:"RESULT_ENDPOINT"`
	Authorization  string `json:"AUTHORIZATION"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	method := event.Method
	url := event.Url
	body := event.Body
	resultEndpoint := event.ResultEndpoint
	authorization := event.Authorization
	var out []byte
	var err error
	var statusCode int
	if body == "" {
		out, err, statusCode = HttpRequest(method, url, nil, nil, 0)
	} else {
		json_data, err := json.Marshal(body)
		if err != nil {
			resp.Successfull = false
			return resp, err
		}
		payload := bytes.NewBuffer(json_data)

		out, err, statusCode = HttpRequest(method, url, payload, nil, 0)
	}

	if err != nil {
		// We just log the error and don't handle handle it, send the result to the ao-api as Failed
		fmt.Printf("Error: %s", err.Error())
		resp.Successfull = false
		return resp, err
	}

	var resultData map[string]interface{}
	if statusCode == http.StatusOK {
		json.Unmarshal(out, &resultData)
		fmt.Print(resultData)
		fmt.Println("calling endpoint")
		//resultData["fileName"] = "name of your created file as output"
		data := map[string]interface{}{
			"status":       "started",
			"return_value": resultData,
			"log":          "",
		}
		headers := []Header{
			{
				Key:   "Content-Type",
				Value: "application/json",
			},
			{
				Key:   "authorization",
				Value: authorization,
			},
		}
		json_data, err := json.Marshal(data)
		if err != nil {
			fmt.Println(err)
			resp.Successfull = false
			return resp, err
		}
		payload := bytes.NewBuffer(json_data)
		out, err, status := HttpRequest(http.MethodPost, resultEndpoint, payload, headers, 0)
		if err != nil {
			fmt.Println(err)
			fmt.Println(status)
			resp.Successfull = false
			return resp, err
		}
		fmt.Println(string(out))
	} else {
		resp.Successfull = false
		return resp, errors.New("request failed with status code " + fmt.Sprint(statusCode))
	}
	fmt.Println("send request was successfull")
	resp.Successfull = true
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
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
