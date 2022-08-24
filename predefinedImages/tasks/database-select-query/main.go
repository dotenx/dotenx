// image: hojjat12/database-get-records:lambda6
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"
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
	Body           []map[string]interface{} `json:"body"`
	ResultEndpoint string                   `json:"RESULT_ENDPOINT"`
	Authorization  string                   `json:"AUTHORIZATION"`
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
	outputCnt := 0
	outputs := make([]map[string]interface{}, 0)
	// resultEndpoint := event.ResultEndpoint
	// authorization := event.Authorization
	for _, val := range event.Body {
		singleInput := val
		dtxAccessToken := singleInput["dtx_access_token"].(string)
		projectTag := singleInput["project_tag"].(string)
		tableName := singleInput["table_name"].(string)
		pageStr := fmt.Sprint(singleInput["page"])
		if pageStr != "" && pageStr != "<nil>" {
			_, err := strconv.Atoi(pageStr)
			if err != nil {
				fmt.Println("page should be a number, error:", err)
				resp.Successfull = false
				continue
			}
		}
		sizeStr := fmt.Sprint(singleInput["size"])
		if sizeStr != "" && sizeStr != "<nil>" {
			_, err := strconv.Atoi(sizeStr)
			if err != nil {
				fmt.Println("size should be a number, error:", err)
				resp.Successfull = false
				continue
			}
		}
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
		if pageStr != "" && pageStr != "<nil>" {
			headers = append(headers, Header{
				Key:   "page",
				Value: pageStr,
			})
		}
		if sizeStr != "" && sizeStr != "<nil>" {
			headers = append(headers, Header{
				Key:   "size",
				Value: sizeStr,
			})
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
			outputs = append(outputs, row)
			outputCnt++
		}
	}

	resp.ReturnValue = map[string]interface{}{
		"outputs": outputs,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("All row(s) selected successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Some/all row(s) can't selected successfully")
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
