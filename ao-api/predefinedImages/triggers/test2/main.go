package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	pipelineEndpoint := os.Getenv("PIPELINE_ENDPOINT")
	fmt.Println("calling endpoint")
	body := make(map[string]interface{})
	innerBody := make(map[string]interface{})
	innerBody["text"] = "message from trigger"
	body["trigger"] = innerBody
	json_data, err := json.Marshal(body)
	if err != nil {
		log.Println(err)
		return
	}
	payload := bytes.NewBuffer(json_data)
	out, err, status := HttpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
	fmt.Println(string(out))
	fmt.Println(err)
	fmt.Println(status)
}

type Header struct {
	Key   string
	Value string
}

func HttpRequest(method string, url string, body io.Reader, headers []Header, timeout time.Duration) (out []byte, err error, statusCode int) {

	var req *http.Request
	if timeout > 0 {
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel()
		req, err = http.NewRequestWithContext(ctx, method, url, body)
	} else {
		req, err = http.NewRequest(method, url, body)
	}
	if err != nil {
		return
	}

	for _, header := range headers {
		req.Header.Add(header.Key, header.Value)
	}

	c := &http.Client{}
	res, err := c.Do(req)
	if err != nil {
		return
	}
	defer res.Body.Close()

	statusCode = res.StatusCode
	out, err = ioutil.ReadAll(res.Body)
	return
}
