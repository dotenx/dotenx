package main

import (
	"encoding/base64"
	"fmt"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	gmail "google.golang.org/api/gmail/v1"
)

func main() {
	accessToken := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	refreshToken := os.Getenv("INTEGRATION_REFRESH_TOKEN")
	from := os.Getenv("from")
	to := os.Getenv("to")
	subject := os.Getenv("subject")
	message := os.Getenv("message")
	err := sendEmail(from, to, subject, message, accessToken, refreshToken)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	fmt.Println("message send successfully")

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
