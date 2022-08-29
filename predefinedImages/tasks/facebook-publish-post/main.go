// image: hojjat12/facebook-publish-post:lambda3
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
)

// type Event struct {
// 	AccessToken string `json:"INTEGRATION_ACCESS_TOKEN"`
// 	PageId      string `json:"page_id"`
// 	Text        string `json:"text"`
// }

type Event struct {
	Body []map[string]interface{} `json:"body"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resp.Successfull = true
	for _, val := range event.Body {
		singleInput := val
		accessToken := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
		text := singleInput["text"].(string)
		pageId := singleInput["page_id"].(string)
		pageAccessToken, err := getPageAccessToken(accessToken, pageId)
		if err != nil {
			fmt.Println(err)
			resp.Successfull = false
			continue
		}
		_, err = publishPost(text, pageId, pageAccessToken)
		if err != nil {
			fmt.Println(err)
			resp.Successfull = false
			continue
		}
	}
	if resp.Successfull {
		fmt.Println("All post(s) successfully published")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func publishPost(text, pageId, pageAccessToken string) (id string, err error) {
	url := "https://graph.facebook.com/" + pageId + "/feed?access_token=" + pageAccessToken
	body := make(map[string]interface{})
	body["message"] = text
	jsonData, err := json.Marshal(body)
	if err != nil {
		fmt.Println(err)
		return
	}
	payload := bytes.NewBuffer(jsonData)
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	out, err, statusCode, _ := httpRequest(http.MethodPost, url, payload, headers, 0)
	if err != nil || statusCode != http.StatusOK {
		fmt.Println("facebook response (publish post request):", string(out))
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from facebook")
		}
		return
	}
	var resp struct {
		Id string `json:"id"`
	}
	err = json.Unmarshal(out, &resp)
	if err != nil {
		fmt.Println(err)
		return
	}
	id = resp.Id
	return
}

func getPageAccessToken(accessToken, pageId string) (pageAccessToken string, err error) {
	url := "https://graph.facebook.com/" + pageId + "?fields=access_token&access_token=" + accessToken
	out, err, statusCode, _ := httpRequest(http.MethodGet, url, nil, nil, 0)
	if err != nil || statusCode != http.StatusOK {
		fmt.Println("facebook response (get page access token request):", string(out))
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from facebook")
		}
		return
	}
	var resp struct {
		PageAccessToken string `json:"access_token"`
		Id              string `json:"id"`
	}
	err = json.Unmarshal(out, &resp)
	if err != nil {
		fmt.Println(err)
		return
	}
	pageAccessToken = resp.PageAccessToken
	return
}

func httpRequest(method string, url string, body io.Reader, headers []Header, timeout time.Duration) (out []byte, err error, statusCode int, header *http.Header) {

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
	header = &res.Header
	return
}

type Header struct {
	Key   string
	Value string
}
