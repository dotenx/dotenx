// image: awrmin/slack-send-message:lambda6
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
	target := singleInput["target_id"].(string)
	text := singleInput["text"].(string)
	access_token := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
	if access_token == "" {
		fmt.Println("Error: There isn't access token, Please check your integration")
		resp.Successfull = false
		// continue
	}
	channel, timestamp, err := SendSlackMessage(text, target, access_token)
	if err != nil {
		fmt.Println(err.Error())
		fmt.Printf("sending message to '%s' wasn't successful\n", target)
		resp.Successfull = false
		// continue
	} else {
		fmt.Printf("sending message to '%s' was successful\n", target)
	}
	// }

	resp.ReturnValue = map[string]interface{}{
		"outputs": map[string]interface{}{
			"channel":   channel,
			"timestamp": timestamp,
		},
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Message was send successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Message wasn't send successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func SendSlackMessage(text, targetId, botAccessToken string) (channel, timestamp string, err error) {
	api := slack.New(botAccessToken)
	channel, timestamp, err = api.PostMessage(
		targetId,
		slack.MsgOptionText(text, false),
	)
	if err != nil {
		return "", "", err
	}
	return
}
