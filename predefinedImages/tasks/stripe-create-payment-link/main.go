// image: stripe/stripe-create-payment-link:lambda
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
	// outputs := make([]map[string]interface{}, 0)
	// resultEndpoint := event.ResultEndpoint
	// authorization := event.Authorization
	// for _, val := range event.Body {
	singleInput := event.Body
	uiUrl := singleInput["UI_URL"].(string)
	secretKey := singleInput["INTEGRATION_SECRET_KEY"].(string)
	customerId := singleInput["CUS_ID"].(string)
	shoppingBag := singleInput["SHOPPING_BAG"].(map[string]interface{})
	bag := make(map[string]int)
	for key, val := range shoppingBag {
		valInt, err := strconv.ParseInt(fmt.Sprint(val), 10, 0)
		if err != nil {
			fmt.Println(err)
			resp.Successfull = false
			return resp, err
		}
		bag[key] = int(valInt)
	}
	// priceId := singleInput["PRICE_ID"].(string)
	// quantity := singleInput["QUANTITY"].(int)
	sc := &client.API{}
	sc.Init(secretKey, nil)
	url, err := createSession(sc, uiUrl, customerId, bag)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
		return resp, err
		// continue
	}
	// outputs = append(outputs, map[string]interface{}{
	// 	"customer_id": id,
	// })
	outputCnt++
	// }

	resp.ReturnValue = map[string]interface{}{
		"outputs": map[string]interface{}{
			"payment_url": url,
		},
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Payment link created successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Payment link can't created successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func createSession(sc *client.API, uiUrl, customerId string, shoppingBag map[string]int) (string, error) {
	bag := make([]*stripe.CheckoutSessionLineItemParams, 0)
	for priceId, quantity := range shoppingBag {
		bag = append(bag, &stripe.CheckoutSessionLineItemParams{
			Price:    stripe.String(priceId),
			Quantity: stripe.Int64(int64(quantity)),
		})
	}
	params := &stripe.CheckoutSessionParams{
		SuccessURL:        stripe.String(uiUrl + "/payment/status/success"),
		CancelURL:         stripe.String(uiUrl + "/payment/status/cancel"),
		LineItems:         bag,
		Mode:              stripe.String(string(stripe.CheckoutSessionModePayment)),
		ClientReferenceID: stripe.String(customerId),
		Customer:          stripe.String(customerId),
	}
	sess, err := sc.CheckoutSessions.New(params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	return sess.URL, err
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
