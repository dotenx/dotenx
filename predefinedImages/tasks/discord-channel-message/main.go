package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/aws/aws-lambda-go/lambda"
)

type Body struct {
	Content string `json:"content"`
}

type Event struct {
	WebhookUrl string `json:"WEBHOOK_URL"`
	Text       string `json:"TEXT"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	lambdaResp := Response{}
	webhookURL := event.WebhookUrl
	text := event.Text
	body := Body{
		Content: text,
	}
	data, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", webhookURL, bytes.NewReader(data))
	req.Header["Content-Type"] = []string{"application/json"}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
		lambdaResp.Successfull = false
		return lambdaResp, err
	}
	if resp.StatusCode != http.StatusOK {
		bytes, _ := ioutil.ReadAll(resp.Body)
		fmt.Printf("send message failed, status: %v, response: %v", resp.StatusCode, string(bytes))
		lambdaResp.Successfull = false
		return lambdaResp, err
	}
	lambdaResp.Successfull = true
	return lambdaResp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}
