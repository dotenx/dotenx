package main

import (
	"fmt"
	"os"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

func main() {
	sender := os.Getenv("sender")
	target := os.Getenv("target")
	text := os.Getenv("text")
	apiKey := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	if apiKey == "" {
		fmt.Println("no api key")
		return
	}
	err := SendGridEmail(apiKey, sender, target, text)
	if err != nil {
		fmt.Println(err.Error())
	}
}

func SendGridEmail(apiKey, sender, target, text string) error {
	from := mail.NewEmail("utopiops", sender)
	subject := "ao email"
	to := mail.NewEmail("for User", target)
	plainTextContent := text
	htmlContent := "<strong>" + text + "</strong>"
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	client := sendgrid.NewSendClient(apiKey)
	_, err := client.Send(message)
	return err
}
