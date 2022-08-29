// iamge: hojjat12/database-update-record:lambda4
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

// type Event struct {
// 	DtxAccessToken string `json:"dtx_access_token"`
// 	ProjectTag     string `json:"project_tag"`
// 	TableName      string `json:"table_name"`
// 	RowId          string `json:"row_id"`
// 	ColumnValues   string `json:"column_values"`
// }

type Event struct {
	Body []map[string]interface{} `json:"body"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resp.Successfull = true
	for _, val := range event.Body {
		singleInput := val
		dtxAccessToken := singleInput["dtx_access_token"].(string)
		projectTag := singleInput["project_tag"].(string)
		tableName := singleInput["table_name"].(string)
		rowId := singleInput["row_id"].(string)
		columnValues := fmt.Sprint(singleInput["column_values"])
		url := fmt.Sprintf("https://api.dotenx.com/database/query/update/project/%s/table/%s/row/%s", projectTag, tableName, rowId)
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
		myMap, ok := singleInput["column_values"].(map[string]interface{})
		if ok {
			jsonMap = myMap
		} else {
			json.Unmarshal([]byte(columnValues), &jsonMap)
		}
		jsonData, err := json.Marshal(jsonMap)
		if err != nil {
			fmt.Println(err)
			resp.Successfull = false
			continue
		}
		payload := bytes.NewBuffer(jsonData)
		out, err, statusCode, _ := httpRequest(http.MethodPut, url, payload, headers, 0)
		fmt.Println("dotenx api status code:", statusCode)
		fmt.Println("dotenx api response (update a record):", string(out))
		if err != nil || statusCode != http.StatusOK {
			fmt.Printf("can't get correct response from dotenx api for row %s\n", rowId)
			resp.Successfull = false
			continue
		}
	}
	if resp.Successfull {
		fmt.Println("All row(s) updated successfully")
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
