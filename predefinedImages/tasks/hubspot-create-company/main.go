// image: hojjat12/hubspot-create-company:lambda
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
	singleInput := event.Body
	accessToken := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
	companyName := fmt.Sprint(singleInput["company_name"])
	domain := fmt.Sprint(singleInput["domain"])
	state := fmt.Sprint(singleInput["state"])
	city := fmt.Sprint(singleInput["city"])
	industry := fmt.Sprint(singleInput["industry"])
	phone := fmt.Sprint(singleInput["phone"])
	aboutUs := fmt.Sprint(singleInput["about_us"])
	address := fmt.Sprint(singleInput["address"])
	address2 := fmt.Sprint(singleInput["address2"])

	apiBody := make(map[string]interface{})
	apiBody["properties"] = make(map[string]interface{})
	if companyName != "" {
		apiBody["properties"].(map[string]interface{})["name"] = companyName
	}
	if domain != "" {
		apiBody["properties"].(map[string]interface{})["domain"] = domain
	}
	if state != "" {
		apiBody["properties"].(map[string]interface{})["state"] = state
	}
	if city != "" {
		apiBody["properties"].(map[string]interface{})["city"] = city
	}
	if industry != "" {
		apiBody["properties"].(map[string]interface{})["industry"] = industry
	}
	if phone != "" {
		apiBody["properties"].(map[string]interface{})["phone"] = phone
	}
	if aboutUs != "" {
		apiBody["properties"].(map[string]interface{})["about_us"] = aboutUs
	}
	if address != "" {
		apiBody["properties"].(map[string]interface{})["address"] = address
	}
	if address2 != "" {
		apiBody["properties"].(map[string]interface{})["address2"] = address2
	}

	jsonData, err := json.Marshal(apiBody)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}
	payload := bytes.NewBuffer(jsonData)
	url := "https://api.hubapi.com/crm/v3/objects/companies"
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

	out, statusCode, _, err := httpRequest(http.MethodPost, url, payload, headers, 0)
	fmt.Println("HubSpot api status code:", statusCode)
	fmt.Println("HubSpot api response (create new company):", string(out))
	if err != nil || (statusCode != http.StatusOK && statusCode != http.StatusCreated) {
		fmt.Printf("can't get correct response from HubSpot api")
		resp.Successfull = false
	}
	outMap := make(map[string]interface{})
	json.Unmarshal(out, &outMap)

	resp.ReturnValue = map[string]interface{}{
		"outputs": outMap,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Company created successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Company can't be created successfully")
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
