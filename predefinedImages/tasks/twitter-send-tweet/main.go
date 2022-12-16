// image: hojjat12/twitter-send-tweet:lambda5
package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/dghubble/go-twitter/twitter"
	"github.com/dghubble/oauth1"
)

// type Event struct {
// 	ConsumerKey       string `json:"INTEGRATION_CONSUMER_KEY"`
// 	ConsumerSecret    string `json:"INTEGRATION_CONSUMER_SECRET"`
// 	AccessToken       string `json:"INTEGRATION_ACCESS_TOKEN"`
// 	AccessTokenSecret string `json:"INTEGRATION_ACCESS_TOKEN_SECRET"`
// 	Text              string `json:"text"`
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
	consumerKey := singleInput["INTEGRATION_CONSUMER_KEY"].(string)
	consumerSecret := singleInput["INTEGRATION_CONSUMER_SECRET"].(string)
	accessToken := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
	accessTokenSecret := singleInput["INTEGRATION_ACCESS_TOKEN_SECRET"].(string)
	text := singleInput["text"].(string)
	tweet, err := sendTweet(text, consumerKey, consumerSecret, accessToken, accessTokenSecret)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
		// continue
	}
	// }

	resp.ReturnValue = map[string]interface{}{
		"outputs": tweet,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Tweet successfully published")
	} else {
		resp.Status = "failed"
		fmt.Println("Tweet can't publish successfully")
	}
	return resp, nil
}

func main() {
	// consumerKey := os.Getenv("INTEGRATION_CONSUMER_KEY")
	// consumerSecret := os.Getenv("INTEGRATION_CONSUMER_SECRET")
	// accessToken := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	// accessTokenSecret := os.Getenv("INTEGRATION_ACCESS_TOKEN_SECRET")
	// text := os.Getenv("text")
	// err := sendTweet(text, consumerKey, consumerSecret, accessToken, accessTokenSecret)
	// if err != nil {
	// 	fmt.Println(err)
	// 	os.Exit(1)
	// }
	// fmt.Println("tweet successfully published")
	lambda.Start(HandleLambdaEvent)
}

// send a tweet based on this repo examples: https://github.com/dghubble/go-twitter
func sendTweet(text, consumerKey, consumerSecret, accessToken, accessTokenSecret string) (tweet *twitter.Tweet, err error) {
	config := oauth1.NewConfig(consumerKey, consumerSecret)
	token := oauth1.NewToken(accessToken, accessTokenSecret)
	httpClient := config.Client(oauth1.NoContext, token)
	// Twitter client
	client := twitter.NewClient(httpClient)
	tweet, _, err = client.Statuses.Update(text, nil)
	return
}
