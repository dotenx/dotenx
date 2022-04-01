package main

import (
	"fmt"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/dghubble/oauth1"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
)

// Implement a function that sends a tweet

// Define an enum with values Oauth2 and Oauth1
type AuthType int

const (
	OAuth2 AuthType = iota
	OAuth1
)

func (s AuthType) String() string {
	switch s {
	case OAuth2:
		return "oauth2"
	case OAuth1:
		return "oauth1"
	default:
		return "oauth1"
	}
}

func main() {

	// Send a Tweet
	client := getClient(OAuth1)
	// tweets, _, _ := client.Timelines.HomeTimeline(&twitter.HomeTimelineParams{})
	// fmt.Println(tweets)
	tweet, resp, err := client.Statuses.Update("Open source is the best way to give back to the community as a developer.", nil)
	if err != nil {
		fmt.Println(err.Error())
	}
	fmt.Println(resp.StatusCode, tweet.Text)
}

func getClient(authType AuthType) *twitter.Client {

	var client *twitter.Client

	switch authType {
	case OAuth2:
		// oauth2 configures a client that uses app credentials to keep a fresh token
		config := &clientcredentials.Config{
			ClientID:     "consumerKey",
			ClientSecret: "consumerSecret",
			TokenURL:     "https://api.twitter.com/oauth2/token",
		}
		// http.Client will automatically authorize Requests
		httpClient := config.Client(oauth2.NoContext)

		// Twitter client
		client = twitter.NewClient(httpClient)
		break
	case OAuth1:

		config := oauth1.NewConfig(consumerKey, consumerSecret)
		token := oauth1.NewToken(accessToken, accessSecret)
		httpClient := config.Client(oauth1.NoContext, token)

		// Twitter client
		client = twitter.NewClient(httpClient)
	}
	return client
}
