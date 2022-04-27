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
	name := os.Getenv("name")
	age := os.Getenv("age")
	resultData := make(map[string]interface{})
	resultData["name"] = name
	resultData["age"] = age
	workspace := os.Getenv("WORKSPACE")
	resultEndpoint := os.Getenv("RESULT_ENDPOINT")
	file, _ := json.MarshalIndent(resultData, "", " ")
	fileName := fmt.Sprintf("/tmp/%s_bio.json", workspace)
	err := os.WriteFile(fileName, file, 0644)
	if err != nil {
		log.Println(err)
	} else {
		outputs := make(map[string]interface{})
		outputs["file"] = fmt.Sprintf("%s_bio.json", workspace)
		data := map[string]interface{}{
			"status":       "started",
			"return_value": outputs,
			"log":          "",
		}
		json_data, err := json.Marshal(data)
		if err != nil {
			log.Println(err)
			return
		}
		payload := bytes.NewBuffer(json_data)
		out, err, status := HttpRequest(http.MethodPost, resultEndpoint, payload, nil, 0)
		if err != nil {
			fmt.Println(err)
			fmt.Println(status)
			return
		}
		fmt.Println(string(out))
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
