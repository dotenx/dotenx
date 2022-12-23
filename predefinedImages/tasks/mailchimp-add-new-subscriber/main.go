// image: hojjat12/mailchimp-add-new-subscriber:lambda
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	Body map[string]interface{} `json:"body"`
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
	accessToken := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
	listId := singleInput["list_id"].(string)
	email := singleInput["email"].(string)
	firstName := singleInput["first_name"].(string)
	lastName := singleInput["last_name"].(string)

	apiEndpoint, err := getApiEndpointOfMailchimpAccount(accessToken)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}
	membersList, err := addSubscriberToList(apiEndpoint, accessToken, listId, email, firstName, lastName)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}

	resp.ReturnValue = map[string]interface{}{
		"outputs": membersList,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Member successfully added")
	} else {
		resp.Status = "failed"
		fmt.Println("Adding member wasn't successful")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

// based on this api document: https://mailchimp.com/developer/marketing/api/list-members/add-member-to-list/
func addSubscriberToList(apiEndpoint, accessToken, listId, email, firstName, lastName string) (membersList interface{}, err error) {
	url := apiEndpoint + "/3.0/lists/" + listId + "/members"
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "Authorization",
			Value: "Bearer " + accessToken,
		},
	}
	body := map[string]interface{}{
		"email_address": email,
		"status":        "subscribed",
		"merge_fields": map[string]interface{}{
			"FNAME": firstName,
			"LNAME": lastName,
		},
	}
	bodyBytes, _ := json.Marshal(body)
	out, err, status, _ := httpRequest(http.MethodPost, url, bytes.NewBuffer(bodyBytes), headers, time.Minute)
	log.Println("mailchimp response:", string(out))
	if err != nil {
		return nil, err
	}
	if status != 200 {
		return nil, errors.New("not ok with status " + fmt.Sprint(status))
	}
	err = json.Unmarshal(out, &membersList)
	return
}

func getApiEndpointOfMailchimpAccount(accessToken string) (string, error) {
	var dto struct {
		Dc          string                 `json:"dc"`
		UserId      int64                  `json:"user_id"`
		Login       map[string]interface{} `json:"login"`
		ApiEndpoint string                 `json:"api_endpoint"`
	}
	url := "https://login.mailchimp.com/oauth2/metadata"
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "Authorization",
			Value: "OAuth " + accessToken,
		},
	}
	out, err, status, _ := httpRequest(http.MethodGet, url, nil, headers, time.Minute)
	fmt.Println("output response:", string(out))
	if err != nil {
		return "", err
	}
	if status != 200 {
		return "", errors.New("not ok with status " + fmt.Sprint(status))
	}
	err = json.Unmarshal(out, &dto)
	return dto.ApiEndpoint, err
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
