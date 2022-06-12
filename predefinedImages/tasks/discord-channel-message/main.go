package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

type Body struct {
	Content string `json:"content"`
}

func main() {
	webhookURL := os.Getenv("WEBHOOK_URL")
	text := os.Getenv("TEXT")
	body := Body{
		Content: text,
	}
	data, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", webhookURL, bytes.NewReader(data))
	req.Header["Content-Type"] = []string{"application/json"}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	if resp.StatusCode != http.StatusOK {
		bytes, _ := ioutil.ReadAll(resp.Body)
		fmt.Printf("send message failed, status: %v, response: %v", resp.StatusCode, string(bytes))
		os.Exit(1)
	}
	return
}
