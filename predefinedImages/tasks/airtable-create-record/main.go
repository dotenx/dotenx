// image: hojjat12/airtable-create-record:lambda
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
	Body map[string]interface{} `json:"body"`
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
	accessToken := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
	baseId := singleInput["base_id"].(string)
	tableIdOrName := singleInput["table_id_or_name"].(string)
	columnValues := fmt.Sprint(singleInput["column_values"])
	var jsonMap map[string]interface{}
	myMap, ok := singleInput["column_values"].(map[string]interface{})
	if ok {
		jsonMap = myMap
	} else {
		json.Unmarshal([]byte(columnValues), &jsonMap)
	}

	response, err := createRecord(accessToken, baseId, tableIdOrName, myMap)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}

	resp.ReturnValue = map[string]interface{}{
		"outputs": response,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Record successfully created")
	} else {
		resp.Status = "failed"
		fmt.Println("Record can't create successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func createRecord(accessToken, baseId, tableIdOrName string, values map[string]interface{}) (response interface{}, err error) {
	url := "https://api.airtable.com/v0/" + baseId + "/" + tableIdOrName
	body := make(map[string]interface{})
	body["fields"] = values
	jsonData, err := json.Marshal(body)
	if err != nil {
		fmt.Println(err)
		return
	}
	payload := bytes.NewBuffer(jsonData)
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", accessToken),
		},
	}
	out, err, statusCode, _ := httpRequest(http.MethodPost, url, payload, headers, 0)
	if err != nil || statusCode != http.StatusOK {
		fmt.Println("Airtable response (create record request):", string(out))
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from Airtable")
		}
		return
	}
	err = json.Unmarshal(out, &response)
	if err != nil {
		fmt.Println(err)
		return
	}
	return
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
