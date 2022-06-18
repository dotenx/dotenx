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
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

type File struct {
	Name           string `json:"name"`
	PathDisplay    string `json:"path_display"`
	Id             string `json:"id"`
	ServerModified string `json:"server_modified"`
}

type Event struct {
	PipelineEndpoint string `json:"PIPELINE_ENDPOINT"`
	TriggerName      string `json:"TRIGGER_NAME"`
	AccountId        string `json:"ACCOUNT_ID"`
	Workspace        string `json:"WORKSPACE"`
	AccessToken      string `json:"INTEGRATION_ACCESS_TOKEN"`
	Path             string `json:"path"`
	PassedSeconds    string `json:"passed_seconds"`
}

type Response struct {
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	pipelineEndpoint := event.PipelineEndpoint
	triggerName := event.TriggerName
	accId := event.AccountId
	if triggerName == "" {
		fmt.Println("your trigger name is not set")
		return resp, errors.New("trigger name is not set")
	}
	workspace := event.Workspace
	accessToken := event.AccessToken
	path := event.Path
	passedSeconds := event.PassedSeconds
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	latestFile, err := getLatestFile(accessToken, path)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	fmt.Printf("latest file in this path: %#v\n", latestFile)

	latestFileUnix, err := time.Parse("2006-01-02T15:04:05Z", latestFile.ServerModified)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	if latestFileUnix.Unix() > selectedUnix {
		body := make(map[string]interface{})
		body["accountId"] = accId
		innerBody := make(map[string]interface{})
		innerBody["name"] = latestFile.Name
		innerBody["path"] = latestFile.PathDisplay
		innerBody["id"] = latestFile.Id
		innerBody["modified_time"] = latestFileUnix.String()
		innerBody["file"] = fmt.Sprintf("%s_%s", workspace, latestFile.Name)
		body["workspace"] = workspace
		body[triggerName] = innerBody
		json_data, err := json.Marshal(body)
		if err != nil {
			fmt.Println(err)
			return resp, err
		}
		payload := bytes.NewBuffer(json_data)
		out, err, status, _ := httpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
		if err != nil {
			fmt.Println("response:", string(out))
			fmt.Println("error:", err)
			fmt.Println("status code:", status)
			return resp, err
		}
		err = saveFile(accessToken, latestFile.PathDisplay, workspace)
		if err != nil {
			fmt.Println(err)
			return resp, err
		}
		fmt.Println("trigger successfully started")
		return resp, nil
	} else {
		fmt.Println("no new file in path")
		return resp, nil
	}
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func getLatestFile(accessToken, path string) (latestFile File, err error) {
	url := "https://api.dropboxapi.com/2/files/list_folder"
	body := map[string]interface{}{
		"path":                                path,
		"recursive":                           true,
		"include_media_info":                  false,
		"include_deleted":                     false,
		"include_has_explicit_shared_members": false,
		"include_mounted_folders":             true,
		"include_non_downloadable_files":      true,
	}
	jsonData, err := json.Marshal(body)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("jsonData:", string(jsonData))
	payload := bytes.NewBuffer(jsonData)
	headers := []Header{
		{
			Key:   "Authorization",
			Value: "Bearer " + accessToken,
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	out, err, statusCode, _ := httpRequest(http.MethodPost, url, payload, headers, 0)
	if err != nil || statusCode != http.StatusOK {
		fmt.Println("dropbox response (get files of path request):", string(out))
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from dropbox")
		}
		return
	}
	var resp struct {
		Entries []map[string]interface{} `json:"entries"`
	}
	err = json.Unmarshal(out, &resp)
	if err != nil {
		fmt.Println(err)
		return
	}
	var latestFileUnix int64 = 0
	latestFileInd := -1
	for i, entry := range resp.Entries {
		if entry[".tag"] != "file" {
			continue
		}
		fileUnix, parseErr := time.Parse("2006-01-02T15:04:05Z", entry["server_modified"].(string))
		if parseErr != nil {
			fmt.Println(parseErr)
			err = errors.New(parseErr.Error())
			return
		}
		if fileUnix.Unix() > latestFileUnix {
			latestFileInd = i
			latestFileUnix = fileUnix.Unix()
		}
	}
	if latestFileInd == -1 {
		return File{}, errors.New("there isn't any file in this path")
	}
	latestFile = File{
		Name:           resp.Entries[latestFileInd]["name"].(string),
		PathDisplay:    resp.Entries[latestFileInd]["path_display"].(string),
		Id:             resp.Entries[latestFileInd]["id"].(string),
		ServerModified: resp.Entries[latestFileInd]["server_modified"].(string),
	}
	return
}

func saveFile(accessToken, path, workspace string) (err error) {
	url := "https://content.dropboxapi.com/2/files/download"
	headers := []Header{
		{
			Key:   "Authorization",
			Value: "Bearer " + accessToken,
		},
		{
			Key:   "Dropbox-API-Arg",
			Value: fmt.Sprintf("{\"path\": \"%s\"}", path),
		},
	}
	out, err, statusCode, responseHeaders := httpRequest(http.MethodPost, url, nil, headers, 0)
	if err != nil || statusCode != http.StatusOK {
		fmt.Println("dropbox response (download file request):", string(out))
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from dropbox")
		}
		return
	}
	fmt.Println(responseHeaders.Get("Dropbox-Api-Result"))
	// fmt.Println(string(out))
	var resp struct {
		Name           string `json:"name"`
		PathLower      string `json:"path_lower"`
		PathDisplay    string `json:"path_display"`
		Id             string `json:"id"`
		ClientModified string `json:"client_modified"`
		ServerModified string `json:"server_modified"`
	}
	err = json.Unmarshal([]byte(responseHeaders.Get("Dropbox-Api-Result")), &resp)
	if err != nil {
		fmt.Println(err)
		return
	}

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-1")},
	)
	bucketName := "dotenx"
	fileName := fmt.Sprintf("%s_%s", workspace, resp.Name)

	// Setup the S3 Upload Manager. Also see the SDK doc for the Upload Manager
	// for more information on configuring part size, and concurrency.
	//
	// http://docs.aws.amazon.com/sdk-for-go/api/service/s3/s3manager/#NewUploader
	uploader := s3manager.NewUploader(sess)
	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(fileName),
		Body:   bytes.NewReader(out),
	})

	// outputPath := fmt.Sprintf("/tmp/%s_%s", workspace, resp.Name)
	// err = os.WriteFile(outputPath, out, 0755)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("File saved successfully")
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
