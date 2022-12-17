// image: awrmin/sendemail:lambda6
package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/sendgrid/rest"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

// type Event struct {
// 	AccessToken string `json:"INTEGRATION_ACCESS_TOKEN"`
// 	Sender      string `json:"sender"`
// 	Target      string `json:"target"`
// 	Text        string `json:"text"`
// }

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
	// for _, val := range event.Body {
	singleInput := event.Body
	sender := singleInput["sender"].(string)
	target := singleInput["target"].(string)
	subject := singleInput["subject"].(string)
	text := singleInput["text"].(string)
	apiKey := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
	if apiKey == "" {
		fmt.Println("no api key")
		resp.Successfull = false
		// continue
	}
	sendGridResp, err := SendGridEmail(apiKey, sender, target, subject, text)
	if err != nil {
		fmt.Println(err.Error())
		fmt.Printf("sending email to '%s' wasn't successful\n", target)
		resp.Successfull = false
		// continue
	} else {
		fmt.Printf("sending email to '%s' was successful\n", target)
	}
	// }
	// sender := event.Sender
	// target := event.Target
	// text := event.Text
	// apiKey := event.AccessToken
	// if apiKey == "" {
	// 	fmt.Println("no api key")
	// 	resp.Successfull = false
	// 	return resp, errors.New("there isn't any api key")
	// }
	// err := SendGridEmail(apiKey, sender, target, text)
	// if err != nil {
	// 	fmt.Println(err.Error())
	// 	resp.Successfull = false
	// 	return resp, err
	// }

	resp.ReturnValue = map[string]interface{}{
		"outputs": sendGridResp,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Email was sent successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Email wasn't sent successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func SendGridEmail(apiKey, sender, target, subject, text string) (*rest.Response, error) {
	from := mail.NewEmail("DoTenX", sender)
	to := mail.NewEmail("for User", target)
	plainTextContent := text
	htmlContent := "<strong>" + text + "</strong>"
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	client := sendgrid.NewSendClient(apiKey)
	return client.Send(message)
}
