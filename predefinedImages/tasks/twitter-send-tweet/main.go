package main

import (
	"fmt"
	"os"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/dghubble/oauth1"
)

func main() {
	consumerKey := os.Getenv("INTEGRATION_CONSUMER_KEY")
	consumerSecret := os.Getenv("INTEGRATION_CONSUMER_SECRET")
	accessToken := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	accessTokenSecret := os.Getenv("INTEGRATION_ACCESS_TOKEN_SECRET")
	text := os.Getenv("text")
	err := sendTweet(text, consumerKey, consumerSecret, accessToken, accessTokenSecret)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("tweet successfully published")
}

// send a tweet based on this repo examples: https://github.com/dghubble/go-twitter
func sendTweet(text, consumerKey, consumerSecret, accessToken, accessTokenSecret string) (err error) {
	config := oauth1.NewConfig(consumerKey, consumerSecret)
	token := oauth1.NewToken(accessToken, accessTokenSecret)
	httpClient := config.Client(oauth1.NoContext, token)
	// Twitter client
	client := twitter.NewClient(httpClient)
	_, _, err = client.Statuses.Update(text, nil)
	return
}
