package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

func main() {
	privateToken := os.Getenv("privateToken")
	id := os.Getenv("id")
	userID := os.Getenv("userId")
	accessLevel := os.Getenv("accessLevel")
	expiresAt := os.Getenv("expiresAt")
	memberType := os.Getenv("source")

	fmt.Printf("removing user %s to %s %s\n", userID, memberType, id)

	endpoint := fmt.Sprintf("/%s/%s/members", memberType, id)

	var method string
	v := url.Values{}
	endpoint += "/" + userID
	method = http.MethodDelete
	apiURL := "https://gitlab.com/api/v4" + endpoint
	payload := strings.NewReader(v.Encode())

	headers := []Header{
		{
			Key:   "PRIVATE-TOKEN",
			Value: privateToken,
		},
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
		{
			Key:   "Content-Length",
			Value: strconv.Itoa(len(v.Encode())),
		},
	}

	out, err, statusCode := HttpRequest(method, apiURL, payload, headers, 0)
	if err != nil {
		// We just log the error and don't handle handle it, send the result to the ao-api as Failed
		fmt.Printf("Error: %s\n", err.Error())
	}

	// Todo: should I show this?
	fmt.Printf("Gitlab Response: %s\n", string(out))

	var resultData map[string]interface{}
	if statusCode == http.StatusOK || statusCode == http.StatusAccepted {
		json.Unmarshal(out, &resultData)
		fmt.Println(resultData)
		fmt.Println("action done successfully")
		return
	} else {
		fmt.Println("action Failed")
		panic("Failed")
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
