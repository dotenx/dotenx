package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/slack-go/slack"
)

type Event struct {
	Body map[string]interface{} `json:"body"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	for _, val := range event.Body {
		singleInput := val.(map[string]interface{})
		target := singleInput["target_id"].(string)
		text := singleInput["text"].(string)
		access_token := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
		if access_token == "" {
			fmt.Println("no access token")
			// resp.Successfull = false
			// return resp, errors.New("there isn't any api key")
			continue
		}
		err := SendSlackMessage(text, target, access_token)
		if err != nil {
			fmt.Println(err.Error())
			// resp.Successfull = false
			// return resp, err
			fmt.Printf("sending message to '%s' wasn't successful\n", target)
			continue
		} else {
			fmt.Printf("sending email to '%s' was successful\n", target)
			resp.Successfull = true
		}
	}
	if resp.Successfull {
		fmt.Println("All/some email(s) send successfully")
	}
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
