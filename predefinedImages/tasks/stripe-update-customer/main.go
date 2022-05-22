package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
)

func main() {
	secretKey := os.Getenv("INTEGRATION_SECRET_KEY")
	name := os.Getenv("CUS_NAME")
	phone := os.Getenv("CUS_PHONE")
	email := os.Getenv("CUS_EMAIL")
	id := os.Getenv("CUS_ID")
	resultEndpoint := os.Getenv("RESULT_ENDPOINT")
	authorization := os.Getenv("AUTHORIZATION")
	sc := &client.API{}
	sc.Init(secretKey, nil)
	id, err := updateCustomer(sc, id, name, phone, email)
	if err != nil {
		log.Fatalln(err)
	}
	outputs := make(map[string]interface{})
	outputs["customer_id"] = id
	data := map[string]interface{}{
		"status":       "started",
		"return_value": outputs,
		"log":          "",
	}
	json_data, err := json.Marshal(data)
	if err != nil {
		log.Println(err)
		return
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
	payload := bytes.NewBuffer(json_data)
	out, err, status := HttpRequest(http.MethodPost, resultEndpoint, payload, headers, 0)
	if err != nil {
		fmt.Println(err)
		fmt.Println(status)
		return
	}
	fmt.Println(string(out))
}

func updateCustomer(sc *client.API, id, Name, Phone, Email string) (string, error) {
	params := &stripe.CustomerParams{
		Name:  stripe.String(Name),
		Phone: stripe.String(Phone),
		Email: stripe.String(Email),
	}
	c, err := sc.Customers.Update(id, params)
	if err != nil {
		log.Println(err)
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
