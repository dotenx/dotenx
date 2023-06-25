// image: dotenx/task-and-trigger:dropbox-create-text-file-lambda
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
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	Body           map[string]interface{} `json:"body"`
	ResultEndpoint string                 `json:"RESULT_ENDPOINT"`
	Authorization  string                 `json:"AUTHORIZATION"`
}

type Response struct {
	Successfull bool                   `json:"successfull"`
	Status      string                 `json:"status"`
	ReturnValue map[string]interface{} `json:"return_value"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resp.Successfull = true
	singleInput := event.Body
	accessToken := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
	path := fmt.Sprint(singleInput["path"])
	fileName := fmt.Sprint(singleInput["file_name"])
	fileExt := fmt.Sprint(singleInput["file_extension"])
	if fileExt == "" {
		fileExt = "txt"
	}
	content := fmt.Sprint(singleInput["content"])
	overwriteStr := fmt.Sprint(singleInput["overwrite"])
	var overwrite = false
	if strings.ToLower(overwriteStr) == "yes" {
		overwrite = true
	} else if strings.ToLower(overwriteStr) == "no" {
		overwrite = false
	} else if overwriteStr != "" {
		fmt.Println("invalid value for overwrite field, the value of this filed should be 'yes' or 'no'")
		resp.Successfull = false
	}

	response, err := writeFileToDropbox(accessToken, path, fileName, fileExt, []byte(content), overwrite)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}

	resp.ReturnValue = map[string]interface{}{
		"outputs": response,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("File upload was successful")
	} else {
		resp.Status = "failed"
		fmt.Println("File upload wasn't successful")
	}
	return resp, nil
}

func writeFileToDropbox(accessToken, path, fileName, fileExt string, content []byte, overwrite bool) (resp map[string]interface{}, err error) {
	url := "https://content.dropboxapi.com/2/files/upload"
	mode := "add"
	if overwrite {
		mode = "overwrite"
	}
	body := map[string]interface{}{
		"path": fmt.Sprintf("%s/%s.%s", path, fileName, fileExt),
		"mode": mode,
	}
	jsonData, err := json.Marshal(body)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("jsonData:", string(jsonData))
	headers := []Header{
		{
			Key:   "Authorization",
			Value: "Bearer " + accessToken,
		},
		{
			Key:   "Content-Type",
			Value: "application/octet-stream",
		},
		{
			Key:   "Dropbox-API-Arg",
			Value: string(jsonData),
		},
	}
	out, statusCode, _, err := httpRequest(http.MethodPost, url, bytes.NewBuffer(content), headers, 0)
	if err != nil || (statusCode != http.StatusOK && statusCode != http.StatusCreated) {
		fmt.Println("dropbox response (upload file on path request):", string(out))
		if statusCode != http.StatusOK && statusCode != http.StatusCreated {
			err = errors.New("can't get correct response from dropbox")
		}
		return
	}
	err = json.Unmarshal(out, &resp)

	return
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func httpRequest(method string, url string, body io.Reader, headers []Header, timeout time.Duration) (out []byte, statusCode int, header *http.Header, err error) {

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
