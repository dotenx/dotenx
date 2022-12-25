// image: hojjat12/mailchimp-archive-subscriber:lambda
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
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

	apiEndpoint, err := getApiEndpointOfMailchimpAccount(accessToken)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}
	err = archiveSubscriberOfList(apiEndpoint, accessToken, listId, email)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}

	resp.ReturnValue = map[string]interface{}{
		"outputs": map[string]interface{}{},
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Member successfully deleted")
	} else {
		resp.Status = "failed"
		fmt.Println("Deleting member wasn't successful")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

// based on this api document: https://mailchimp.com/developer/marketing/api/list-members/archive-list-member/
func archiveSubscriberOfList(apiEndpoint, accessToken, listId, email string) (err error) {
	url := apiEndpoint + "/3.0/lists/" + listId + "/members/" + email
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
	_, err, status, _ := httpRequest(http.MethodDelete, url, nil, headers, time.Minute)
	if err != nil {
		return err
	}
	if status != http.StatusNoContent {
		return errors.New("not ok with status " + fmt.Sprint(status))
	}
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
