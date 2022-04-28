package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

type File struct {
	Name           string `json:"name"`
	PathDisplay    string `json:"path_display"`
	Id             string `json:"id"`
	ServerModified string `json:"server_modified"`
}

func main() {
	pipelineEndpoint := os.Getenv("PIPELINE_ENDPOINT")
	triggerName := os.Getenv("TRIGGER_NAME")
	if triggerName == "" {
		log.Println("your trigger name is not set")
		return
	}
	workspace := os.Getenv("WORKSPACE")
	accessToken := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	path := os.Getenv("path")
	passedSeconds := os.Getenv("passed_seconds")
	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		log.Println(err.Error())
		return
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	latestFile, err := getLatestFile(accessToken, path)
	if err != nil {
		log.Println(err)
		return
	}
	fmt.Printf("latest file in this path: %#v\n", latestFile)

	latestFileUnix, err := time.Parse("2006-01-02T15:04:05Z", latestFile.ServerModified)
	if err != nil {
		log.Println(err)
		return
	}
	if latestFileUnix.Unix() > selectedUnix {
		body := make(map[string]interface{})
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
		err = saveFile(accessToken, latestFile.PathDisplay, workspace)
		if err != nil {
			log.Println(err)
			return
		}
		return
	} else {
		log.Println("no new file in path")
		return
	}

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
		log.Println(err)
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
		log.Println("dropbox response (get files of path request):", string(out))
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
		log.Println(err)
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
			log.Println(parseErr)
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
		log.Println("dropbox response (download file request):", string(out))
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
		log.Println(err)
		return
	}
	outputPath := fmt.Sprintf("/tmp/%s_%s", workspace, resp.Name)
	err = os.WriteFile(outputPath, out, 0755)
	if err != nil {
		log.Println(err)
		return
	}
	log.Println("File saved successfully")
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
