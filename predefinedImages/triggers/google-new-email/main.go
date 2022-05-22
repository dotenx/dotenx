package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	gmail "google.golang.org/api/gmail/v1"
)

func main() {
	pipelineEndpoint := os.Getenv("PIPELINE_ENDPOINT")
	accId := os.Getenv("ACCOUNT_ID")
	triggerName := os.Getenv("TRIGGER_NAME")
	if triggerName == "" {
		log.Println("your trigger name is not set")
		return
	}
	accessToken := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	refreshToken := os.Getenv("INTEGRATION_REFRESH_TOKEN")
	_, err := listMessages(accessToken, refreshToken)
	if err != nil {
		log.Println(err)
		return
	}

	passedSeconds := os.Getenv("passed_seconds")
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		log.Println(err.Error())
		return
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	messages, err := listMessages(accessToken, refreshToken)
	if err != nil {
		log.Println(err)
		return
	}
	if len(messages) > 0 {
		if messages[0].InternalDate/1000 > selectedUnix {
			body := make(map[string]interface{})
			body["accountId"] = accId
			innerBody := make(map[string]interface{})
			msgBody, _ := base64.URLEncoding.DecodeString(messages[0].Payload.Body.Data)
			innerBody["body"] = string(msgBody)
			innerBody["date"] = time.Unix(messages[0].InternalDate/1000, 0).String()
			for _, header := range messages[0].Payload.Headers {
				if header.Name == "From" || header.Name == "To" || header.Name == "Subject" {
					innerBody[strings.ToLower(header.Name)] = header.Value
				}
			}
			body[triggerName] = innerBody
			json_data, err := json.Marshal(body)
			if err != nil {
				log.Println(err)
				return
			}
			payload := bytes.NewBuffer(json_data)
			out, err, status, _ := httpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
			if err != nil {
				log.Println("response:", string(out))
				log.Println("error:", err)
				log.Println("status code:", status)
				return
			}
			log.Println("trigger successfully started")
			return
		} else {
			log.Println("no new message in inbox")
			return
		}
	} else {
		log.Println("no message in inbox")
		return
	}

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
		log.Println(err.Error())
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
