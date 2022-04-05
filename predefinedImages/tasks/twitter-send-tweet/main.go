package main

import (
	"log"
	"os"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/dghubble/oauth1"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
)

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

	var client *twitter.Client

	if os.Getenv("integration_type") == "twitter_oauth2" {
		client = getClient(OAuth2)
	} else {
		client = getClient(OAuth1)
	}
	_, _, err := client.Statuses.Update(os.Getenv("text"), nil)
	if err != nil {
		log.Fatal(err)
	}
}

func getClient(authType AuthType) *twitter.Client {

	var client *twitter.Client

	switch authType {
	case OAuth2:
		config := &clientcredentials.Config{
			ClientID:     os.Getenv("consumerKey"),
			ClientSecret: os.Getenv("consumerSecret"),
			TokenURL:     "https://api.twitter.com/oauth2/token",
		}
		httpClient := config.Client(oauth2.NoContext)

		client = twitter.NewClient(httpClient)
		break
	case OAuth1:
		consumerKey := os.Getenv("consumerKey")
		consumerSecret := os.Getenv("consumerSecret")
		accessToken := os.Getenv("accessToken")
		accessSecret := os.Getenv("accessSecret")
		config := oauth1.NewConfig(consumerKey, consumerSecret)
		token := oauth1.NewToken(accessToken, accessSecret)
		httpClient := config.Client(oauth1.NoContext, token)
		client = twitter.NewClient(httpClient)
	}
	return client
}
