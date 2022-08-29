// image: awrmin/slack-send-message:lambda4
package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/slack-go/slack"
)

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
		target := singleInput["target_id"].(string)
		text := singleInput["text"].(string)
		access_token := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
		if access_token == "" {
			fmt.Println("Error: There isn't access token, Please check your integration")
			resp.Successfull = false
			continue
		}
		err := SendSlackMessage(text, target, access_token)
		if err != nil {
			fmt.Println(err.Error())
			fmt.Printf("sending message to '%s' wasn't successful\n", target)
			resp.Successfull = false
			continue
		} else {
			fmt.Printf("sending message to '%s' was successful\n", target)
		}
	}
	if resp.Successfull {
		fmt.Println("All message(s) was send successfully")
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
