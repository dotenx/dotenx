package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	Body map[string]interface{} `json:"body"`
}

// type Event struct {
// 	Method         string `json:"method"`
// 	Url            string `json:"url"`
// 	Body           string `json:"body"`
// 	ResultEndpoint string `json:"RESULT_ENDPOINT"`
// 	Authorization  string `json:"AUTHORIZATION"`
// }

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resultData := make(map[string]map[string]interface{})
	var resultEndpoint, authorization string
	for index, val := range event.Body {
		singleInput := val.(map[string]interface{})
		method := singleInput["method"].(string)
		url := singleInput["url"].(string)
		body := singleInput["body"].(string)
		resultEndpoint = singleInput["RESULT_ENDPOINT"].(string)
		authorization = singleInput["AUTHORIZATION"].(string)
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

		if statusCode == http.StatusOK {
			var res map[string]interface{}
			json.Unmarshal(out, &res)
			resultData[index] = res
		}
	}
	if resp.Successfull {
		fmt.Println("All/some requests sent successfully")
		fmt.Println("calling endpoint")
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
	}
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
