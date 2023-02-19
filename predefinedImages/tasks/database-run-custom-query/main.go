// image: hojjat12/database-run-custom-query:lambda
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

type Response struct {
	Successfull bool                   `json:"successfull"`
	Status      string                 `json:"status"`
	ReturnValue map[string]interface{} `json:"return_value"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resp.Successfull = true
	// outputCnt := 0
	// outputs := make([]map[string]interface{}, 0)
	singleInput := event.Body
	dtxAccessToken := singleInput["dtx_access_token"].(string)
	projectTag := singleInput["project_tag"].(string)
	query := singleInput["query"].(string)

	url := fmt.Sprintf("https://api.dotenx.com/database/query/arbitrary/project/%s", projectTag)
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
	jsonMap := map[string]interface{}{
		"query": query,
	}
	jsonData, err := json.Marshal(jsonMap)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
		// continue
	}
	payload := bytes.NewBuffer(jsonData)
	dtxRespBytes, err, statusCode, _ := httpRequest(http.MethodPost, url, payload, headers, 0)
	fmt.Println("dotenx api status code:", statusCode)
	fmt.Println("dotenx api response (select records):", string(dtxRespBytes))
	if err != nil || statusCode != http.StatusOK {
		fmt.Printf("can't get correct response from dotenx api")
		resp.Successfull = false
	}

	dtxResp := make(map[string]interface{})
	err = json.Unmarshal(dtxRespBytes, &dtxResp)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}

	resp.ReturnValue = map[string]interface{}{
		"outputs": dtxResp,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Query run successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Query couldn't run successfully")
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
