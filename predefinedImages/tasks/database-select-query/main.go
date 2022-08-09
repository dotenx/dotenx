// image: hojjat12/database-get-records:lambda3
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

// type Event struct {
// 	DtxAccessToken string                 `json:"dtx_access_token"`
// 	ProjectTag     string                 `json:"project_tag"`
// 	TableName      string                 `json:"table_name"`
// 	Body           map[string]interface{} `json:"body"`
// 	ResultEndpoint string                 `json:"RESULT_ENDPOINT"`
// 	Authorization  string                 `json:"AUTHORIZATION"`
// }

type Event struct {
	Body           map[string]interface{} `json:"body"`
	ResultEndpoint string                 `json:"RESULT_ENDPOINT"`
	Authorization  string                 `json:"AUTHORIZATION"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resp.Successfull = true
	outputCnt := 0
	outputs := make(map[string]interface{})
	resultEndpoint := event.ResultEndpoint
	authorization := event.Authorization
	for _, val := range event.Body {
		singleInput := val.(map[string]interface{})
		dtxAccessToken := singleInput["dtx_access_token"].(string)
		projectTag := singleInput["project_tag"].(string)
		tableName := singleInput["table_name"].(string)
		body := fmt.Sprint(singleInput["body"])
		url := fmt.Sprintf("https://api.dotenx.com/database/query/select/project/%s/table/%s", projectTag, tableName)
		headers := []Header{
			{
				Key:   "Content-Type",
				Value: "application/json",
			},
			{
				Key:   "DTX-auth",
				Value: dtxAccessToken,
			},
		}
		var jsonMap map[string]interface{}
		myMap, ok := singleInput["body"].(map[string]interface{})
		if ok {
			jsonMap = myMap
		} else {
			json.Unmarshal([]byte(body), &jsonMap)
		}
		jsonData, err := json.Marshal(jsonMap)
		if err != nil {
			fmt.Println(err)
			resp.Successfull = false
			continue
		}
		payload := bytes.NewBuffer(jsonData)
		dtxRespBytes, err, statusCode, _ := httpRequest(http.MethodPost, url, payload, headers, 0)
		fmt.Println("dotenx api status code:", statusCode)
		fmt.Println("dotenx api response (select records):", string(dtxRespBytes))
		if err != nil || statusCode != http.StatusOK {
			fmt.Printf("can't get correct response from dotenx api")
			resp.Successfull = false
			continue
		}

		dtxResp := make([]map[string]interface{}, 0)
		err = json.Unmarshal(dtxRespBytes, &dtxResp)
		if err != nil {
			fmt.Println(err)
			resp.Successfull = false
			continue
		}

		for _, row := range dtxResp {
			outputs[fmt.Sprint(outputCnt)] = row
			outputCnt++
		}
	}

	data := map[string]interface{}{
		"status":       "started",
		"return_value": outputs,
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
	jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
		return resp, err
	}
	payload := bytes.NewBuffer(jsonData)
	out, err, status, _ := httpRequest(http.MethodPost, resultEndpoint, payload, headers, 0)
	fmt.Println("dotenx api status code:", status)
	fmt.Println("dotenx api response (set results):", string(out))
	if err != nil || status != http.StatusOK {
		if status != http.StatusOK {
			err = errors.New("can't get correct response from dotenx api")
		}
		resp.Successfull = false
		return resp, err
	}

	if resp.Successfull {
		fmt.Println("All row(s) selected successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
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
