// image: awrmin/dotenx-http-call:lambda3
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
	Body           map[string]interface{} `json:"body"`
	ResultEndpoint string                 `json:"RESULT_ENDPOINT"`
	Authorization  string                 `json:"AUTHORIZATION"`
}

// type Event struct {
// 	Method         string `json:"method"`
// 	Url            string `json:"url"`
// 	Body           string `json:"body"`
// 	ResultEndpoint string `json:"RESULT_ENDPOINT"`
// 	Authorization  string `json:"AUTHORIZATION"`
// }

type Response struct {
	Successfull bool                   `json:"successfull"`
	Status      string                 `json:"status"`
	ReturnValue map[string]interface{} `json:"return_value"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resp.Successfull = true
	// resultEndpoint := event.ResultEndpoint
	// authorization := event.Authorization
	resultData := make(map[string]interface{})
	for index, val := range event.Body {
		singleInput := val.(map[string]interface{})
		method := singleInput["method"].(string)
		url := singleInput["url"].(string)
		body := fmt.Sprint(singleInput["body"])
		var out []byte
		var err error
		var statusCode int
		if body == "" {
			out, err, statusCode = HttpRequest(method, url, nil, nil, 0)
		} else {
			var jsonMap map[string]interface{}
			myMap, ok := singleInput["body"].(map[string]interface{})
			if ok {
				jsonMap = myMap
			} else {
				json.Unmarshal([]byte(body), &jsonMap)
			}
			jsonData, err := json.Marshal(jsonMap)
			if err != nil {
				fmt.Printf("Error: %s", err.Error())
				resp.Successfull = false
				continue
			}
			payload := bytes.NewBuffer(jsonData)
			out, err, statusCode = HttpRequest(method, url, payload, nil, 0)
			if err != nil {
				fmt.Printf("Error: %s", err.Error())
				resp.Successfull = false
				continue
			}
		}

		if err != nil {
			// We just log the error and don't handle handle it, send the result to the ao-api as Failed
			fmt.Printf("Error: %s", err.Error())
			resp.Successfull = false
			continue
		}

		fmt.Println("Status code:", statusCode)
		// if statusCode >= http.StatusOK && statusCode <= 299 {
		var res interface{}
		json.Unmarshal(out, &res)
		resultData[index] = res
		// }
	}

	resp.ReturnValue = resultData
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("All request(s) sended successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Some/all request(s) can't sended successfully")
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
