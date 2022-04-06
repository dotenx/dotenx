package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

type Body struct {
	Content string `json:"content"`
}

func main() {
	webhookURL := os.Getenv("INTEGRATION_URL")
	text := os.Getenv("TEXT")
	body := Body{
		Content: text,
	}
	data, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", webhookURL, bytes.NewReader(data))
	req.Header["Content-Type"] = []string{"application/json"}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatalln(err)
	}
	if resp.StatusCode != http.StatusOK {
		bytes, _ := ioutil.ReadAll(resp.Body)
		log.Fatalf("send message failed, status: %v, response: %v", resp.StatusCode, string(bytes))
	}
	return
}
