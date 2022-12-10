// image: awrmin/google-new-email:lambda6
package main

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	gmail "google.golang.org/api/gmail/v1"
)

type Event struct {
	PipelineEndpoint string `json:"PIPELINE_ENDPOINT"`
	TriggerName      string `json:"TRIGGER_NAME"`
	AccountId        string `json:"ACCOUNT_ID"`
	AccessToken      string `json:"INTEGRATION_ACCESS_TOKEN"`
	RefreshToken     string `json:"INTEGRATION_REFRESH_TOKEN"`
	PassedSeconds    string `json:"passed_seconds"`
}

type Response struct {
	Triggered   bool                   `json:"triggered"`
	ReturnValue map[string]interface{} `json:"return_value"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	// pipelineEndpoint := event.PipelineEndpoint
	accId := event.AccountId
	triggerName := event.TriggerName
	if triggerName == "" {
		fmt.Println("your trigger name is not set")
		return resp, errors.New("trigger name is not set")
	}
	accessToken := event.AccessToken
	refreshToken := event.RefreshToken

	passedSeconds := event.PassedSeconds
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	messages, err := listMessages(accessToken, refreshToken)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}

	body := make(map[string]interface{})
	outerBody := make([]map[string]interface{}, 0)
	if len(messages) > 0 {
		for i, _ := range messages {
			if messages[i].InternalDate/1000 > selectedUnix {
				body["accountId"] = accId
				innerBody := make(map[string]interface{})
				innerBody["id"] = messages[i].Id
				innerBody["body_plain"] = getBodyOfMessage(messages[i].Payload.Parts, "text/plain")
				innerBody["body_html"] = getBodyOfMessage(messages[i].Payload.Parts, "text/html")
				innerBody["date"] = time.Unix(messages[i].InternalDate/1000, 0).String()
				innerBody["headers"] = make(map[string]interface{})
				for _, header := range messages[i].Payload.Headers {
					innerBody["headers"].(map[string]interface{})[header.Name] = header.Value
				}
				outerBody = append(outerBody, innerBody)
			}
		}
	} else {
		fmt.Println("no message in inbox")
		resp.Triggered = false
		return resp, nil
	}

	if len(outerBody) != 0 {
		body[triggerName] = outerBody
		resp.Triggered = true
		resp.ReturnValue = body
		fmt.Println("trigger activated successfully")
		return resp, nil
	} else {
		fmt.Println("no new message in inbox")
		resp.Triggered = false
		return resp, nil
	}
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func listMessages(accessToken, refreshToken string) (messages []*gmail.Message, err error) {

	token := &oauth2.Token{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	config, _ := google.ConfigFromJSON([]byte{}, gmail.GmailReadonlyScope)

	// Create the *http.Client using the access token
	client := config.Client(oauth2.NoContext, token)
	// Create a new gmail service using the client
	gmailService, err := gmail.New(client)

	gMessages, err := gmailService.Users.Messages.List("me").Q("label:inbox").Do()
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	messages = make([]*gmail.Message, 0)
	cnt := 0
	for _, m := range gMessages.Messages {
		cnt++
		if cnt > 20 {
			break
		}
		msg, _ := gmailService.Users.Messages.Get("me", m.Id).Do()
		messages = append(messages, msg)
	}

	return
}

/*
supported mimeType:
"text/plain"
"text/html"
*/
func getBodyOfMessage(messageParts []*gmail.MessagePart, mimeType string) string {
	results := make([]string, 0)
	for i, _ := range messageParts {
		if len(messageParts[i].Parts) == 0 {
			if messageParts[i].MimeType == mimeType {
				plainTextBytes, _ := base64.URLEncoding.DecodeString(messageParts[i].Body.Data)
				results = append(results, string(plainTextBytes))
			}
		} else {
			tmp := getBodyOfMessage(messageParts[i].Parts, mimeType)
			results = append(results, tmp)
		}
	}
	result := strings.TrimSuffix(strings.Join(results, "|"), "|")
	return result
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
