package main

import (
	"errors"
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type Event struct {
	AccessToken string `json:"INTEGRATION_ACCESS_TOKEN"`
	Sender      string `json:"sender"`
	Target      string `json:"target"`
	Text        string `json:"text"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	sender := event.Sender
	target := event.Target
	text := event.Text
	apiKey := event.AccessToken
	if apiKey == "" {
		fmt.Println("no api key")
		resp.Successfull = false
		return resp, errors.New("there isn't any api key")
	}
	err := SendGridEmail(apiKey, sender, target, text)
	if err != nil {
		fmt.Println(err.Error())
		resp.Successfull = false
		return resp, err
	}
	fmt.Println("email send successfully")
	resp.Successfull = true
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func SendGridEmail(apiKey, sender, target, text string) error {
	from := mail.NewEmail("DoTenX", sender)
	subject := "ao email"
	to := mail.NewEmail("for User", target)
	plainTextContent := text
	htmlContent := "<strong>" + text + "</strong>"
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	client := sendgrid.NewSendClient(apiKey)
	_, err := client.Send(message)
	return err
}
