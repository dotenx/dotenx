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
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
)

// type Event struct {
// 	SecretKey      string `json:"INTEGRATION_SECRET_KEY"`
// 	CusName        string `json:"CUS_NAME"`
// 	CusPhone       string `json:"CUS_PHONE"`
// 	CusEmail       string `json:"CUS_EMAIL"`
// 	ResultEndpoint string `json:"RESULT_ENDPOINT"`
// 	Authorization  string `json:"AUTHORIZATION"`
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
		secretKey := singleInput["INTEGRATION_SECRET_KEY"].(string)
		name := singleInput["CUS_NAME"].(string)
		phone := singleInput["CUS_PHONE"].(string)
		email := singleInput["CUS_EMAIL"].(string)
		sc := &client.API{}
		sc.Init(secretKey, nil)
		id, err := createCustomer(sc, name, phone, email)
		if err != nil {
			fmt.Println(err)
			resp.Successfull = false
			continue
		}
		outputs[fmt.Sprint(outputCnt)] = map[string]interface{}{
			"customer_id": id,
		}
		outputCnt++
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
	json_data, err := json.Marshal(data)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
		return resp, err
	}
	payload := bytes.NewBuffer(json_data)
	out, err, status := HttpRequest(http.MethodPost, resultEndpoint, payload, headers, 0)
	if err != nil || status != http.StatusOK {
		fmt.Println("err:", err)
		fmt.Println("status code:", status)
		resp.Successfull = false
		return resp, err
	}
	fmt.Println(string(out))

	if resp.Successfull {
		fmt.Println("All customer(s) created successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func createCustomer(sc *client.API, Name, Phone, Email string) (string, error) {
	params := &stripe.CustomerParams{
		Name:  stripe.String(Name),
		Phone: stripe.String(Phone),
		Email: stripe.String(Email),
	}
	c, err := sc.Customers.New(params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	return c.ID, err
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
