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
	"strconv"
	"time"

	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
)

//status: `requires_payment_method`, `requires_confirmation`, `requires_action`, `processing`, `requires_capture`, `canceled`, or `succeeded`

type payment struct {
	ID            string `json:"id"`
	Amount        int64  `json:"amount"`
	Currency      string `json:"currency"`
	Created       string `json:"created"`
	CustomerId    string `json:"customer_id"`
	CustomerEmail string `json:"customer_email"`
	Description   string `json:"description"`
	Status        string `json:"status"`
}

func main() {
	secretKey := os.Getenv("INTEGRATION_SECRET_KEY")
	passedSeconds := os.Getenv("passed_seconds")
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		log.Println(err.Error())
		return
	}
	status := os.Getenv("PAYMENT_STATUS")
	selectedUnix := time.Now().Unix() - (int64(seconds))
	pipelineEndpoint := os.Getenv("PIPELINE_ENDPOINT")
	workspace := os.Getenv("WORKSPACE")
	triggerName := os.Getenv("TRIGGER_NAME")
	if triggerName == "" {
		log.Println("your trigger name is not set")
		return
	}
	sc := &client.API{}
	sc.Init(secretKey, nil)
	payments, err := retrivePayments(sc, status, int(selectedUnix))
	if err != nil {
		log.Fatalln(err)
	}
	for _, p := range payments {
		body := map[string]interface{}{
			"workspace": workspace,
			triggerName: p,
		}
		json_data, err := json.Marshal(body)
		if err != nil {
			log.Fatalln(err)
			return
		}
		payload := bytes.NewBuffer(json_data)
		out, err, status := HttpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
		if err != nil {
			fmt.Println(status)
			log.Fatalln(err)
			return
		}
		fmt.Println(string(out))
	}
}

func retrivePayments(sc *client.API, status string, interval int) ([]payment, error) {
	params := &stripe.PaymentIntentListParams{
		CreatedRange: &stripe.RangeQueryParams{
			GreaterThanOrEqual: int64(interval),
		},
	}
	res := make([]payment, 0)
	payments := sc.PaymentIntents.List(params)
	for payments.Next() {
		current := payments.PaymentIntent()
		if string(current.Status) == status {
			res = append(res, payment{
				ID:            current.ID,
				Amount:        current.Amount,
				Currency:      current.Currency,
				Created:       time.Unix(current.Created, 0).UTC().Format(time.RFC3339),
				CustomerId:    current.Customer.ID,
				CustomerEmail: current.Customer.Email,
				Description:   current.Description,
				Status:        string(current.Status),
			})
		}
	}
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
