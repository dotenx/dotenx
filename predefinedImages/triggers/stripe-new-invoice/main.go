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
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
)

type Event struct {
	PipelineEndpoint string `json:"PIPELINE_ENDPOINT"`
	TriggerName      string `json:"TRIGGER_NAME"`
	AccountId        string `json:"ACCOUNT_ID"`
	SecretKey        string `json:"INTEGRATION_SECRET_KEY"`
	Workspace        string `json:"WORKSPACE"`
	PassedSeconds    string `json:"passed_seconds"`
}

type Response struct {
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
	selectedUnix := time.Now().Unix() - (int64(seconds))
	pipelineEndpoint := event.PipelineEndpoint
	workspace := event.Workspace
	triggerName := event.TriggerName

	if triggerName == "" {
		fmt.Println("your trigger name is not set")
		return resp, errors.New("trigger name is not set")
	}
	sc := &client.API{}
	sc.Init(secretKey, nil)
	invoices, err := getInvoices(sc, selectedUnix)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	innerOut := make(map[string]map[string]interface{})
	for index, i := range invoices {
		innerOut[strconv.Itoa(index)] = map[string]interface{}{
			"id":               i.Id,
			"description":      i.Description,
			"link":             i.Link,
			"pdf_link":         i.PdfLink,
			"paid":             i.Paid,
			"amount_due":       i.AmountDue,
			"amount_paid":      i.AmountPaid,
			"amount_remaining": i.AmountRemaining,
			"currency":         i.Currency,
			"created":          i.Created,
			"customer_id":      i.CustomerId,
			"customer_email":   i.CustomerEmail,
		}
	}
	body := map[string]interface{}{
		"workspace": workspace,
		triggerName: innerOut,
		"accountId": accId,
	}
	json_data, err := json.Marshal(body)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	payload := bytes.NewBuffer(json_data)
	out, err, status := HttpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
	if err != nil {
		fmt.Println(status)
		fmt.Println(err)
		return resp, err
	}
	fmt.Println(string(out))
	fmt.Println("trigger successfully ended")
	return resp, nil
}

type Invoice struct {
	Id              string `json:"id"`
	Description     string `json:"description"`
	Link            string `json:"link"`
	PdfLink         string `json:"pdf_link"`
	Paid            bool   `json:"paid"`
	AmountDue       int64  `json:"amount_due"`
	AmountPaid      int64  `json:"amount_paid"`
	AmountRemaining int64  `json:"amount_remaining"`
	Currency        string `json:"currency"`
	Created         string `json:"created"`
	CustomerId      string `json:"customer_id"`
	CustomerEmail   string `json:"customer_email"`
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func getInvoices(sc *client.API, interval int64) ([]Invoice, error) {
	params := &stripe.InvoiceListParams{
		CreatedRange: &stripe.RangeQueryParams{
			GreaterThanOrEqual: interval,
		},
	}
	invoiceList := make([]Invoice, 0)
	invoices := sc.Invoices.List(params)
	for invoices.Next() {
		invoice := invoices.Invoice()
		curr := Invoice{
			Id:              invoice.ID,
			Description:     invoice.Description,
			Link:            invoice.HostedInvoiceURL,
			PdfLink:         invoice.InvoicePDF,
			Paid:            invoice.Paid,
			AmountDue:       invoice.AmountDue,
			AmountPaid:      invoice.AmountPaid,
			AmountRemaining: invoice.AmountRemaining,
			Currency:        string(invoice.Currency),
			Created:         time.Unix(invoice.Created, 0).UTC().Format(time.RFC3339),
			CustomerId:      invoice.Customer.ID,
			CustomerEmail:   invoice.Customer.Email,
		}
		invoiceList = append(invoiceList, curr)
		//break
	}
	return invoiceList, nil
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
