// iamge: hojjat12/starshipit-create-order:lambda
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
	"os"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
)

// type Event struct {
// 	AccessToken string `json:"INTEGRATION_ACCESS_TOKEN"`
// 	PageId      string `json:"page_id"`
// 	Text        string `json:"text"`
// }

type Event struct {
	Body map[string]interface{} `json:"body"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resp.Successfull = true
	for _, val := range event.Body {
		singleInput := val.(map[string]interface{})
		// required fields
		accessToken := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
		subscriptionKey := os.Getenv("STARSHIPIT_SUBSCRIPTION_KEY")
		orderNumber := singleInput["order_number"].(string)
		destinationName := singleInput["destination_name"].(string)
		destinationStreet := singleInput["destination_street"].(string)
		destinationSuburb := singleInput["destination_suburb"].(string)
		destinationState := singleInput["destination_state"].(string)
		destinationCountry := singleInput["destination_country"].(string)

		// optional fields
		orderDate, _ := singleInput["order_date"].(string)
		reference, _ := singleInput["reference"].(string)
		shippingMethod, _ := singleInput["shipping_method"].(string)
		signatureRequired, _ := singleInput["signature_required"].(bool)

		destinationPhone, _ := singleInput["destination_phone"].(string)
		destinationPostCode, _ := singleInput["destination_post_code"].(string)
		destinationDeliveryInstructions, _ := singleInput["destination_delivery_instructions"].(string)

		items, _ := singleInput["items"].([]map[string]interface{})

		starshipitBody := map[string]interface{}{
			"order": map[string]interface{}{
				"order_date":         orderDate,
				"order_number":       orderNumber,
				"reference":          reference,
				"shipping_method":    shippingMethod,
				"signature_required": signatureRequired,
				"destination": map[string]interface{}{
					"name":                  destinationName,
					"phone":                 destinationPhone,
					"street":                destinationStreet,
					"suburb":                destinationSuburb,
					"state":                 destinationState,
					"post_code":             destinationPostCode,
					"country":               destinationCountry,
					"delivery_instructions": destinationDeliveryInstructions,
				},
				"items": items,
			},
		}

		_, err := createOrder(starshipitBody, accessToken, subscriptionKey)
		if err != nil {
			fmt.Println(err)
			resp.Successfull = false
			continue
		}
	}
	if resp.Successfull {
		fmt.Println("All post(s) successfully published")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func createOrder(body map[string]interface{}, accessToken, subscriptionKey string) (response map[string]interface{}, err error) {
	url := "https://api.starshipit.com/api/orders"
	jsonData, err := json.Marshal(body)
	if err != nil {
		fmt.Println(err)
		return
	}
	payload := bytes.NewBuffer(jsonData)
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "StarShipIT-Api-Key",
			Value: accessToken,
		},
		{
			Key:   "Ocp-Apim-Subscription-Key",
			Value: subscriptionKey,
		},
	}
	out, err, statusCode, _ := httpRequest(http.MethodPost, url, payload, headers, 0)
	fmt.Println("starshipit response (create order request):", string(out))
	if err != nil || statusCode != http.StatusOK {
		fmt.Println("error:", err)
		fmt.Println("status code:", statusCode)
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from starshipit")
		}
		return
	}
	err = json.Unmarshal(out, &response)
	if err != nil {
		fmt.Println(err)
		return
	}
	return
}

func httpRequest(method string, url string, body io.Reader, headers []Header, timeout time.Duration) (out []byte, err error, statusCode int, header *http.Header) {

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
	header = &res.Header
	return
}

type Header struct {
	Key   string
	Value string
}
