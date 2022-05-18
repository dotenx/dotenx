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
	secretKey := os.Getenv("INTEGRATION_SECRET_KEY")
	passedSeconds := os.Getenv("passed_seconds")
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		log.Println(err.Error())
		return
	}
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
	invoices, err := getInvoices(sc, selectedUnix)
	if err != nil {
		log.Fatalln(err)
	}
	for _, i := range invoices {
		body := map[string]interface{}{
			"workspace": workspace,
			triggerName: i,
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
