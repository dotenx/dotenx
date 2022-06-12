package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
)

func main() {
	secretKey := os.Getenv("INTEGRATION_SECRET_KEY")
	email := os.Getenv("CUS_EMAIL")
	id := os.Getenv("CUS_ID")
	resultEndpoint := os.Getenv("RESULT_ENDPOINT")
	authorization := os.Getenv("AUTHORIZATION")
	sc := &client.API{}
	sc.Init(secretKey, nil)
	cus, err := findCustomer(sc, id, email)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	data := map[string]interface{}{
		"status":       "started",
		"return_value": cus,
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
		os.Exit(1)
	}
	payload := bytes.NewBuffer(json_data)
	out, err, status := HttpRequest(http.MethodPost, resultEndpoint, payload, headers, 0)
	if err != nil {
		fmt.Println(err)
		fmt.Println(status)
		return
	}
	fmt.Println(string(out))
}

func findCustomer(sc *client.API, id, Email string) (map[string]interface{}, error) {
	var cus *stripe.Customer
	var err error
	if Email != "" {
		params := &stripe.CustomerListParams{
			Email: stripe.String(Email),
		}
		customers := sc.Customers.List(params)
		for customers.Next() {
			cus = customers.Customer()
			break
		}
	}
	if id != "" && cus == nil {
		cus, err = sc.Customers.Get(id, nil)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
	}
	res := make(map[string]interface{})
	res["customer_id"] = cus.ID
	res["customer_email"] = cus.Email
	return res, nil
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
