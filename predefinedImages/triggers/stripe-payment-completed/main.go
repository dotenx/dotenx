// image: awrmin/stripe-payment-completed:lambda6
package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
)

//status: `requires_payment_method`, `requires_confirmation`, `requires_action`, `processing`, `requires_capture`, `canceled`, or `succeeded`

type Event struct {
	PipelineEndpoint string `json:"PIPELINE_ENDPOINT"`
	TriggerName      string `json:"TRIGGER_NAME"`
	AccountId        string `json:"ACCOUNT_ID"`
	SecretKey        string `json:"INTEGRATION_SECRET_KEY"`
	Workspace        string `json:"WORKSPACE"`
	Status           string `json:"PAYMENT_STATUS"`
	PassedSeconds    string `json:"passed_seconds"`
}

type Response struct {
	Triggered   bool                   `json:"triggered"`
	ReturnValue map[string]interface{} `json:"return_value"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	secretKey := event.SecretKey
	passedSeconds := event.PassedSeconds
	accId := event.AccountId
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	status := event.Status
	selectedUnix := time.Now().Unix() - (int64(seconds))
	// pipelineEndpoint := event.PipelineEndpoint
	workspace := event.Workspace
	triggerName := event.TriggerName

	if triggerName == "" {
		fmt.Println("your trigger name is not set")
		return resp, errors.New("trigger name is not set")
	}
	sc := &client.API{}
	sc.Init(secretKey, nil)
	payments, err := retrivePayments(sc, status, int(selectedUnix))
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	innerOut := make([]map[string]interface{}, 0)
	for _, p := range payments {
		innerOut = append(innerOut, map[string]interface{}{
			"id":             p.ID,
			"amount":         p.Amount,
			"currency":       p.Currency,
			"created":        p.Created,
			"customer_id":    p.CustomerId,
			"customer_email": p.CustomerEmail,
			"description":    p.Description,
			"status":         p.Status,
			"items":          p.Items,
		})
	}
	returnValue := map[string]interface{}{
		"workspace": workspace,
		triggerName: innerOut,
		"accountId": accId,
	}
	resp.ReturnValue = returnValue
	if len(innerOut) > 0 {
		resp.Triggered = true
	}
	fmt.Println("trigger successfully ended")
	return resp, nil
}

type payment struct {
	ID            string      `json:"id"`
	Amount        int64       `json:"amount"`
	Currency      string      `json:"currency"`
	Created       string      `json:"created"`
	CustomerId    string      `json:"customer_id"`
	CustomerEmail string      `json:"customer_email"`
	Description   string      `json:"description"`
	Status        string      `json:"status"`
	Items         interface{} `json:"items"`
}

func main() {
	lambda.Start(HandleLambdaEvent)
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
			checkoutSessParams := &stripe.CheckoutSessionListParams{
				PaymentIntent: &current.ID,
			}
			items := make([]stripe.LineItem, 0)
			checkoutSessions := sc.CheckoutSessions.List(checkoutSessParams)
			for checkoutSessions.Next() {
				checkoutSession := checkoutSessions.CheckoutSession()
				lineItems := sc.CheckoutSessions.ListLineItems(checkoutSession.ID, nil)
				for lineItems.Next() {
					items = append(items, *lineItems.LineItem())
				}
			}
			res = append(res, payment{
				ID:            current.ID,
				Amount:        current.Amount,
				Currency:      current.Currency,
				Created:       time.Unix(current.Created, 0).UTC().Format(time.RFC3339),
				CustomerId:    current.Customer.ID,
				CustomerEmail: current.Customer.Email,
				Description:   current.Description,
				Status:        string(current.Status),
				Items:         items,
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
