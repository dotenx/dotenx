// image: stripe/stripe-update-customer:lambda3
package main

import (
	"context"
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
	Successfull bool                   `json:"successfull"`
	Status      string                 `json:"status"`
	ReturnValue map[string]interface{} `json:"return_value"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resp.Successfull = true
	outputCnt := 0
	outputs := make(map[string]interface{})
	// resultEndpoint := event.ResultEndpoint
	// authorization := event.Authorization
	for _, val := range event.Body {
		singleInput := val.(map[string]interface{})
		secretKey := singleInput["INTEGRATION_SECRET_KEY"].(string)
		name := singleInput["CUS_NAME"].(string)
		phone := singleInput["CUS_PHONE"].(string)
		email := singleInput["CUS_EMAIL"].(string)
		id := singleInput["CUS_ID"].(string)
		sc := &client.API{}
		sc.Init(secretKey, nil)
		id, err := updateCustomer(sc, id, name, phone, email)
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

	resp.ReturnValue = outputs
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("All customer(s) updated successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Some/all customer(s) can't updated successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func updateCustomer(sc *client.API, id, Name, Phone, Email string) (string, error) {
	params := &stripe.CustomerParams{
		Name:  stripe.String(Name),
		Phone: stripe.String(Phone),
		Email: stripe.String(Email),
	}
	c, err := sc.Customers.Update(id, params)
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
