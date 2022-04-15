package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

func main() {
	pipelineEndpoint := os.Getenv("PIPELINE_ENDPOINT")
	triggerName := os.Getenv("TRIGGER_NAME")
	if triggerName == "" {
		log.Println("your trigger name is not set")
		return
	}
	accessToken := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	passedSeconds := os.Getenv("passed_seconds")
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		log.Println(err.Error())
		return
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	userId, err := getUserId(accessToken)
	if err != nil {
		log.Println(err)
		return
	}
	postsCreatedTime, err := getPostsList(userId, accessToken)
	if err != nil {
		log.Println(err)
		return
	}
	if len(postsCreatedTime) > 0 {
		lastPostUnix, err := time.Parse("2006-01-02T15:04:05-0700", postsCreatedTime[0])
		if err != nil {
			log.Println(err)
			return
		}
		if lastPostUnix.Unix() > selectedUnix {
			body := make(map[string]interface{})
			innerBody := make(map[string]interface{})
			innerBody["created_time"] = lastPostUnix.String()
			body[triggerName] = innerBody
			json_data, err := json.Marshal(body)
			if err != nil {
				log.Println(err)
				return
			}
			payload := bytes.NewBuffer(json_data)
			out, err, status, _ := httpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
			if err != nil {
				log.Println("response:", string(out))
				log.Println("error:", err)
				log.Println("status code:", status)
				return
			}
			log.Println("trigger successfully started")
			return
		} else {
			log.Println("no new post in page")
			return
		}
	} else {
		log.Println("no post in page")
		return
	}

}

func getUserId(accessToken string) (userId string, err error) {
	url := "https://graph.facebook.com/me?access_token=" + accessToken
	out, err, statusCode, _ := httpRequest(http.MethodGet, url, nil, nil, 0)
	if err != nil || statusCode != http.StatusOK {
		log.Println("facebook response (get user id request):", string(out))
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from facebook")
		}
		return
	}
	var resp struct {
		Name string `json:"name"`
		Id   string `json:"id"`
	}
	err = json.Unmarshal(out, &resp)
	if err != nil {
		log.Println(err)
		return
	}
	userId = resp.Id
	return
}

func getPostsList(userId, accessToken string) (postsCreatedTime []string, err error) {
	url := "https://graph.facebook.com/" + userId + "/feed?access_token=" + accessToken
	out, err, statusCode, _ := httpRequest(http.MethodGet, url, nil, nil, 0)
	if err != nil || statusCode != http.StatusOK {
		log.Println("facebook response (get posts list request):", string(out))
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from facebook")
		}
		return
	}
	type post struct {
		CreatedTime string `json:"created_time"`
		Message     string `json:"message"`
		Id          string `json:"id"`
	}
	var resp struct {
		Data []post `json:"data"`
	}
	err = json.Unmarshal(out, &resp)
	if err != nil {
		log.Println(err)
		return
	}
	postsCreatedTime = make([]string, 0)
	for _, p := range resp.Data {
		postsCreatedTime = append(postsCreatedTime, p.CreatedTime)
	}
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
