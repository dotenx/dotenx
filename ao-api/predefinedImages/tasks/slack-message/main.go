package main

import (
	"fmt"
	"log"
	"os"

	"github.com/slack-go/slack"
)

func main() {
	access_token := os.Getenv("access_token")
	text := os.Getenv("text")
	target := os.Getenv("target_id")
	err := SendSlackMessage(text, target, access_token)
	if err != nil {
		log.Println(err)
		return
	}
	fmt.Println("message sent")
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
