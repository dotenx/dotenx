// image: hojjat12/google-send-email:lambda3
package main

import (
	"encoding/base64"
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	gmail "google.golang.org/api/gmail/v1"
)

// type Event struct {
// 	AccessToken  string `json:"INTEGRATION_ACCESS_TOKEN"`
// 	RefreshToken string `json:"INTEGRATION_REFRESH_TOKEN"`
// 	From         string `json:"from"`
// 	To           string `json:"to"`
// 	Subject      string `json:"subject"`
// 	Message      string `json:"message"`
// }

type Event struct {
	Body []map[string]interface{} `json:"body"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resp.Successfull = true
	for _, val := range event.Body {
		singleInput := val
		accessToken := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
		refreshToken := singleInput["INTEGRATION_REFRESH_TOKEN"].(string)
		from := singleInput["from"].(string)
		to := singleInput["to"].(string)
		subject := singleInput["subject"].(string)
		message := singleInput["message"].(string)
		err := sendEmail(from, to, subject, message, accessToken, refreshToken)
		if err != nil {
			fmt.Println(err)
			resp.Successfull = false
			continue
		}
	}
	if resp.Successfull {
		fmt.Println("All email(s) sended successfully")
	}
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
