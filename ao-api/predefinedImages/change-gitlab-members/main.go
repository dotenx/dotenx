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
	memberType := os.Getenv("type")
	action := os.Getenv("action")

	fmt.Printf("%s user %s to %s %s\n", action, userID, memberType, id)

	endpoint := fmt.Sprintf("/%s/%s/members", memberType, id)

	var method string
	v := url.Values{}
	if action == "add" {
		method = http.MethodPost
		v.Set("user_id", userID)
		v.Set("access_level", accessLevel)
		if expiresAt != "" {
			v.Set("expires_at", expiresAt)
		}
	} else {
		endpoint += "/" + userID
		method = http.MethodDelete
	}
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

// For more details see: https://docs.gitlab.com/ee/api/members.html#add-a-member-to-a-group-or-project
// Attribute		Type						Required	Description
// id						integer/string	yes				The ID or URL-encoded path of the project or group owned by the authenticated user
// user_id			integer/string	yes				The user ID of the new member or multiple IDs separated by commas
// access_level	integer					yes				A valid access level
// expires_at		string					no				A date string in the format YEAR-MONTH-DAY

// examples:
// curl --request POST --header "PRIVATE-TOKEN: <your_access_token>" --data "user_id=1&access_level=30" "https://gitlab.example.com/api/v4/groups/:id/members"
// curl --request POST --header "PRIVATE-TOKEN: <your_access_token>" --data "user_id=1&access_level=30" "https://gitlab.example.com/api/v4/projects/:id/members"

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
