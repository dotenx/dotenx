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
	email := os.Getenv("CUS_EMAIL")
	id := os.Getenv("CUS_ID")
	resultEndpoint := os.Getenv("RESULT_ENDPOINT")
	sc := &client.API{}
	sc.Init(secretKey, nil)
	cus, err := findCustomer(sc, id, email)
	if err != nil {
		log.Fatalln(err)
	}
	outputs := make(map[string]interface{})
	outputs["customer"] = cus
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
	payload := bytes.NewBuffer(json_data)
	out, err, status := HttpRequest(http.MethodPost, resultEndpoint, payload, nil, 0)
	if err != nil {
		fmt.Println(err)
		fmt.Println(status)
		return
	}
	fmt.Println(string(out))
}

func findCustomer(sc *client.API, id, Email string) (string, error) {
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
	if id != "" {
		cus, err = sc.Customers.Get(id, nil)
		if err != nil {
			log.Println(err)
			return "", err
		}
	}
	bytes, _ := json.Marshal(*cus)
	return string(bytes), nil
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
