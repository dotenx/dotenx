// image: hojjat12/stripe-create-price:lambda
package main

import (
	"context"
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
	secretKey := singleInput["INTEGRATION_SECRET_KEY"].(string)
	productId := singleInput["product_id"].(string)
	// currency is three-letter ISO currency code, in lowercase. Must be a supported currency.
	currency := singleInput["currency"].(string)
	// unit_amount is a positive integer in cents (or 0 for a free price) representing how much to charge.
	unitAmount := singleInput["unit_amount"].(string)
	if unitAmount == "" {
		unitAmount = "0"
	}
	unitAmountInt, err := strconv.Atoi(unitAmount)
	if err != nil {
		fmt.Println(err.Error())
		resp.Successfull = false
	}
	// recurring_interval specifies billing frequency. Either day, week, month or year.
	recurringInterval := singleInput["recurring_interval"].(string)
	// recurring_interval_count is the number of intervals between subscription billings. For example, interval=month and interval_count=3 bills every 3 months. Maximum of one year interval allowed (1 year, 12 months, or 52 weeks).
	recurringIntervalCount := singleInput["recurring_interval_count"].(string)
	if recurringIntervalCount == "" {
		recurringIntervalCount = "0"
	}
	recurringIntervalCountInt, err := strconv.Atoi(recurringIntervalCount)
	if err != nil {
		fmt.Println(err.Error())
		resp.Successfull = false
	}
	sc := &client.API{}
	sc.Init(secretKey, nil)
	price, err := createPrice(sc, productId, currency, int64(unitAmountInt), recurringInterval, int64(recurringIntervalCountInt))
	if err != nil {
		fmt.Println(err.Error())
		resp.Successfull = false
	}

	resp.ReturnValue = map[string]interface{}{
		"outputs": map[string]interface{}{
			"price": price,
		},
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Price created successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Price can't be created successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func createPrice(sc *client.API, productId, currency string, unitAmount int64, recurringInterval string, recurringIntervalCount int64) (stripe.Price, error) {
	var params *stripe.PriceParams
	if recurringInterval != "" {
		params = &stripe.PriceParams{
			Product:    stripe.String(productId),
			UnitAmount: stripe.Int64(unitAmount),
			Currency:   stripe.String(currency),
			Recurring: &stripe.PriceRecurringParams{
				Interval:      stripe.String(recurringInterval),
				IntervalCount: stripe.Int64(recurringIntervalCount),
			},
		}
	} else {
		params = &stripe.PriceParams{
			Product:    stripe.String(productId),
			UnitAmount: stripe.Int64(unitAmount),
			Currency:   stripe.String(currency),
		}
	}
	p, err := sc.Prices.New(params)
	if err != nil {
		fmt.Println(err)
		return stripe.Price{}, err
	}
	return *p, err
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
