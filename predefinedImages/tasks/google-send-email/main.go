package main

import (
	"encoding/base64"
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	gmail "google.golang.org/api/gmail/v1"
)

type Event struct {
	AccessToken  string `json:"INTEGRATION_ACCESS_TOKEN"`
	RefreshToken string `json:"INTEGRATION_REFRESH_TOKEN"`
	From         string `json:"from"`
	To           string `json:"to"`
	Subject      string `json:"subject"`
	Message      string `json:"message"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	accessToken := event.AccessToken
	refreshToken := event.RefreshToken
	from := event.From
	to := event.To
	subject := event.Subject
	message := event.Message
	err := sendEmail(from, to, subject, message, accessToken, refreshToken)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
		return resp, err
	}
	fmt.Println("message send successfully")
	resp.Successfull = true
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func sendEmail(from, to, subject, message, accessToken, refreshToken string) (err error) {

	token := &oauth2.Token{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	config, _ := google.ConfigFromJSON([]byte{}, gmail.GmailReadonlyScope)

	// Create the *http.Client using the access token
	client := config.Client(oauth2.NoContext, token)
	// Create a new gmail service using the client
	gmailService, err := gmail.New(client)
	// Compose the message
	messageStr := []byte(
		"From: " + from + "\r\n" +
			"To: " + to + "\r\n" +
			"Subject: " + subject + "\r\n\r\n" +
			message)

	// Place messageStr into message.Raw in base64 encoded format
	var gMessage gmail.Message = gmail.Message{
		Raw: base64.URLEncoding.EncodeToString(messageStr),
	}
	_, err = gmailService.Users.Messages.Send("me", &gMessage).Do()
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	return
}
