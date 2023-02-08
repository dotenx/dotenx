// image: hojjat12/sendgrid-send-email:lambda7
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
	Body map[string]interface{} `json:"body"`
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
	sender := singleInput["sender"].(string)
	target := singleInput["target"].(string)
	subject := singleInput["subject"].(string)
	textContent := singleInput["text_content"].(string)
	htmlContent := singleInput["html_content"].(string)
	apiKey := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
	if apiKey == "" {
		fmt.Println("no api key")
		resp.Successfull = false
	}
	sendGridResp, err := sendGridSendEmail(apiKey, sender, target, subject, textContent, htmlContent)
	if err != nil {
		fmt.Println(err.Error())
		fmt.Printf("sending email to '%s' wasn't successful\n", target)
		resp.Successfull = false
	} else {
		fmt.Printf("sending email to '%s' was successful\n", target)
	}

	resp.ReturnValue = map[string]interface{}{
		"outputs": sendGridResp,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Email was sent successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Email wasn't sent successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func sendGridSendEmail(apiKey, sender, target, subject, textContent, htmlContent string) (map[string]interface{}, error) {
	if textContent == "" && htmlContent == "" {
		return nil, errors.New("at least one of the text or html content parameters must be provided")
	}
	targets := make([]map[string]string, 0)
	for _, t := range strings.Split(strings.ReplaceAll(target, " ", ""), ",") {
		targets = append(targets, map[string]string{
			"email": t,
			"name":  "DoTenX third-party user",
		})
	}
	// SEE: https://docs.sendgrid.com/api-reference/mail-send/mail-send
	sendMailUrl := "https://api.sendgrid.com/v3/mail/send"
	sendMailBody := make(map[string]interface{})
	personalizations := make([]map[string]interface{}, 0)
	personalizations = append(personalizations, map[string]interface{}{
		"subject": subject,
		"to":      targets,
	})
	sendMailBody["personalizations"] = personalizations
	sendMailBody["from"] = map[string]interface{}{
		"email": sender,
		"name":  "DoTenX",
	}

	if textContent != "" {
		sendMailBody["content"] = []map[string]string{
			{
				"type":  "text/plain",
				"value": textContent,
			},
		}
	}
	if htmlContent != "" {
		sendMailBody["content"] = []map[string]string{
			{
				"type":  "text/html",
				"value": htmlContent,
			},
		}
	}

	sendMailHeaders := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", apiKey),
		},
	}
	jsonData, err := json.Marshal(sendMailBody)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	fmt.Println("body of send mail request:", string(jsonData))
	out, err, statusCode := HttpRequest(http.MethodPost, sendMailUrl, bytes.NewBuffer(jsonData), sendMailHeaders, 0)
	if err != nil || statusCode != http.StatusAccepted {
		fmt.Println("SendGrid response (send email request):", string(out))
		if statusCode != http.StatusAccepted {
			err = errors.New(fmt.Sprint("can't get correct response from SendGrid. Status code: ", statusCode))
		}
		return nil, err
	}
	response := make(map[string]interface{})
	json.Unmarshal(out, &response)
	return response, nil
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
