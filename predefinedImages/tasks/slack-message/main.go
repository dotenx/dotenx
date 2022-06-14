package main

import (
	"fmt"
	"log"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/slack-go/slack"
)

type Event struct {
	AccessToken string `json:"INTEGRATION_ACCESS_TOKEN"`
	Target      string `json:"target_id"`
	Text        string `json:"text"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	access_token := event.AccessToken
	text := event.Text
	target := event.Target
	err := SendSlackMessage(text, target, access_token)
	if err != nil {
		log.Println(err)
		resp.Successfull = false
		return resp, err
	}
	fmt.Println("message sent successfully")
	resp.Successfull = true
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func SendSlackMessage(text, targetId, botAccessToken string) error {
	api := slack.New(botAccessToken)
	_, _, err := api.PostMessage(
		targetId,
		slack.MsgOptionText(text, false),
	)
	if err != nil {
		return err
	}
	return nil
}
