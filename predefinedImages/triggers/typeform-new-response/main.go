// image: hojjat12/typeform-new-response:lambda4
package main

import (
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
)

type FormResponse struct {
	SubmittedAt string                   `json:"submitted_at"`
	Metadata    map[string]interface{}   `json:"metadata"`
	Answers     []map[string]interface{} `json:"answers"`
	ResponseId  string                   `json:"response_id"`
}

type FormField struct {
	Id    string `json:"id"`
	Title string `json:"title"`
	Type  string `json:"type"`
}

type Event struct {
	PipelineEndpoint string `json:"PIPELINE_ENDPOINT"`
	TriggerName      string `json:"TRIGGER_NAME"`
	AccountId        string `json:"ACCOUNT_ID"`
	AccessToken      string `json:"INTEGRATION_ACCESS_TOKEN"`
	FormId           string `json:"form_id"`
	PassedSeconds    string `json:"passed_seconds"`
}

type Response struct {
	Triggered   bool                   `json:"triggered"`
	ReturnValue map[string]interface{} `json:"return_value"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	// pipelineEndpoint := event.PipelineEndpoint
	triggerName := event.TriggerName
	accId := event.AccountId
	if triggerName == "" {
		fmt.Println("your trigger name is not set")
		return resp, errors.New("trigger name is not set")
	}
	accessToken := event.AccessToken
	formId := event.FormId
	passedSeconds := event.PassedSeconds

	seconds, err := strconv.Atoi(passedSeconds)
	if err != nil {
		fmt.Println(err.Error())
		return resp, err
	}
	selectedUnix := time.Now().Unix() - (int64(seconds))
	resps, err := getResponsesList(formId, accessToken, selectedUnix)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	def, err := getFormDefinition(formId, accessToken)
	if err != nil {
		fmt.Println(err)
		return resp, err
	}
	innerBody := make([]map[string]interface{}, 0)
	if len(resps) > 0 {
		for _, resp := range resps {
			myAnswer := make(map[string]string)
			for _, ans := range resp.Answers {
				fieldId := ans["field"].(map[string]interface{})["id"].(string)
				fieldTitle := def[fieldId]
				ansType := ans["type"].(string)
				ansStr := fmt.Sprint(ans[ansType])
				myAnswer[fieldTitle] = ansStr
			}
			answers, _ := json.Marshal(myAnswer)
			output := make(map[string]interface{})
			output["submitted_at"] = resp.SubmittedAt
			output["response_id"] = resp.ResponseId
			output["answers"] = string(answers)
			innerBody = append(innerBody, output)
		}
	} else {
		fmt.Println("no new response in form")
		resp.Triggered = false
		return resp, nil
	}

	fmt.Println("innerBody:", innerBody)
	returnValue := make(map[string]interface{})
	returnValue["accountId"] = accId
	returnValue[triggerName] = innerBody
	resp.ReturnValue = returnValue
	resp.Triggered = true
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

// func startAutomation(pipelineEndpoint, triggerName, accountId string, innerBody map[string]interface{}) (statusCode int, err error) {
// 	body := make(map[string]interface{})
// 	body["accountId"] = accountId
// 	body[triggerName] = innerBody
// 	json_data, err := json.Marshal(body)
// 	if err != nil {
// 		fmt.Println(err)
// 		return 0, err
// 	}
// 	fmt.Println("final body:", string(json_data))
// 	payload := bytes.NewBuffer(json_data)
// 	out, err, status, _ := httpRequest(http.MethodPost, pipelineEndpoint, payload, nil, 0)
// 	if err != nil || status != http.StatusOK {
// 		fmt.Println("response:", string(out))
// 		fmt.Println("error:", err)
// 		fmt.Println("status code:", status)
// 		if err == nil {
// 			err = errors.New("can't get correct response from dotenx api")
// 		}
// 		return 0, err
// 	}
// 	fmt.Println("trigger successfully started")
// 	return status, nil
// }

func getFormDefinition(formId, accessToken string) (definition map[string]string, err error) {
	definition = make(map[string]string)
	url := "https://api.typeform.com/forms/" + formId
	headers := []Header{
		{
			Key:   "Authorization",
			Value: "Bearer " + accessToken,
		},
	}
	out, err, statusCode, _ := httpRequest(http.MethodGet, url, nil, headers, 0)
	if err != nil || statusCode != http.StatusOK {
		fmt.Println("typeform response (get form definition request):", string(out))
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from typeform")
		}
		return
	}
	var resp struct {
		Fields []FormField `json:"fields"`
	}
	err = json.Unmarshal(out, &resp)
	if err != nil {
		fmt.Println(err)
		return
	}
	for _, field := range resp.Fields {
		definition[field.Id] = field.Title
	}
	return
}

func getResponsesList(formId, accessToken string, since int64) (resps []FormResponse, err error) {
	url := "https://api.typeform.com/forms/" + formId + "/responses?since=" + fmt.Sprint(since)
	headers := []Header{
		{
			Key:   "Authorization",
			Value: "Bearer " + accessToken,
		},
	}
	out, err, statusCode, _ := httpRequest(http.MethodGet, url, nil, headers, 0)
	if err != nil || statusCode != http.StatusOK {
		fmt.Println("typeform response (get responses list request):", string(out))
		if statusCode != http.StatusOK {
			err = errors.New("can't get correct response from typeform")
		}
		return
	}
	var resp struct {
		Items []FormResponse `json:"items"`
	}
	err = json.Unmarshal(out, &resp)
	if err != nil {
		fmt.Println(err)
		return
	}
	resps = resp.Items
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
