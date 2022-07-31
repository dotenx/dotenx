package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/aws/aws-lambda-go/lambda"
)

type DiscordBody struct {
	Content string `json:"content"`
}

// type Event struct {
// 	WebhookUrl string `json:"WEBHOOK_URL"`
// 	Text       string `json:"TEXT"`
// }

type Event struct {
	Body map[string]interface{} `json:"body"`
}
type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	lambdaResp := Response{}
	lambdaResp.Successfull = true
	for _, val := range event.Body {
		singleInput := val.(map[string]interface{})
		webhookURL := singleInput["WEBHOOK_URL"].(string)
		text := singleInput["TEXT"].(string)
		discordBody := DiscordBody{
			Content: text,
		}
		data, _ := json.Marshal(discordBody)
		req, _ := http.NewRequest("POST", webhookURL, bytes.NewReader(data))
		req.Header["Content-Type"] = []string{"application/json"}
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			fmt.Println(err)
			lambdaResp.Successfull = false
			continue
		}
		if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
			bytes, _ := ioutil.ReadAll(resp.Body)
			fmt.Printf("send message failed, status: %v, response: %v\n", resp.StatusCode, string(bytes))
			lambdaResp.Successfull = false
			continue
		}
	}
	if lambdaResp.Successfull {
		fmt.Println("All message(s) sended successfully")
	}
	return lambdaResp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}
