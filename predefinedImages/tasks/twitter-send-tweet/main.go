package main

import "os"

func main() {
	accessToken := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	text := os.Getenv("text")
}

func sendTweet(text, accessToken string) (err error) {

}
