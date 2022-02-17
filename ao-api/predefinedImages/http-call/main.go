package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"time"
)

func main() {
	method := os.Getenv("method")
	url := os.Getenv("url")
	body := os.Getenv("body")
	var out []byte
	var err error
	var statusCode int
	if body == "" {
		out, err, statusCode = HttpRequest(method, url, nil, nil, 0)
	} else {
		json_data, err := json.Marshal(body)
		if err != nil {
			return
		}
		payload := bytes.NewBuffer(json_data)

		out, err, statusCode = HttpRequest(method, url, payload, nil, 0)
	}

	if err != nil {
		// We just log the error and don't handle handle it, send the result to the ao-api as Failed
		fmt.Printf("Error: %s", err.Error())
		return
	}

	var resultData map[string]interface{}
	if statusCode == http.StatusOK {
		json.Unmarshal(out, &resultData)
		fmt.Print(resultData)
		file, _ := json.MarshalIndent(resultData, "", " ")
		err = ioutil.WriteFile("test.json", file, 0644)
		if err != nil {
			fmt.Println(err.Error())
		}
		fmt.Println("request sent successfully")
		return
	} else {
		fmt.Println("Failed to sent request")
		panic("Failed")
		return
	}
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
