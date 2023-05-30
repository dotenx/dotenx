// image: hojjat12/hubspot-create-engagement:lambda
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
	engagementType := fmt.Sprint(singleInput["engagement_type"])
	assignedTo := fmt.Sprint(singleInput["assigned_to"])
	contactIdList := fmt.Sprint(singleInput["contact_id_list"])
	companyIdList := fmt.Sprint(singleInput["company_id_list"])
	dealIdList := fmt.Sprint(singleInput["deal_id_list"])
	ticketIdList := fmt.Sprint(singleInput["ticket_id_list"])
	// Notes
	noteBody := fmt.Sprint(singleInput["note_body"])
	// Meetings
	meetingTitle := fmt.Sprint(singleInput["meeting_title"])
	meetingDescription := fmt.Sprint(singleInput["meeting_description"])
	meetingStartTime := fmt.Sprint(singleInput["meeting_start_time"])
	meetingEndTime := fmt.Sprint(singleInput["meeting_end_time"])
	// Emails
	emailSenderAddress := fmt.Sprint(singleInput["email_sender_address"])
	emailSenderFirstname := fmt.Sprint(singleInput["email_sender_firstname"])
	emailSenderLastname := fmt.Sprint(singleInput["email_sender_lastname"])
	emailRecipientAddress := fmt.Sprint(singleInput["email_recipient_address"])
	emailSubject := fmt.Sprint(singleInput["email_subject"])
	emailText := fmt.Sprint(singleInput["email_text"])
	emailHtml := fmt.Sprint(singleInput["email_html"])
	// Calls
	callFromNumber := fmt.Sprint(singleInput["call_from_number"])
	callToNumber := fmt.Sprint(singleInput["call_to_number"])
	callStatus := fmt.Sprint(singleInput["call_status"])
	callBody := fmt.Sprint(singleInput["call_body"])

	apiBody := make(map[string]interface{})
	associations := make([]map[string]interface{}, 0)
	var fromObjectType string
	apiBody["properties"] = make(map[string]interface{})
	switch strings.ToUpper(engagementType) {
	case "NOTE":
		apiBody["properties"].(map[string]interface{})["hs_timestamp"] = time.Now().Format(time.RFC3339)
		apiBody["properties"].(map[string]interface{})["hs_note_body"] = noteBody
		if assignedTo != "" {
			apiBody["properties"].(map[string]interface{})["hubspot_owner_id"] = assignedTo
		}
		fromObjectType = "notes"
	case "MEETING":
		apiBody["properties"].(map[string]interface{})["hs_timestamp"] = time.Now().Format(time.RFC3339)
		apiBody["properties"].(map[string]interface{})["hs_meeting_title"] = meetingTitle
		apiBody["properties"].(map[string]interface{})["hs_meeting_body"] = meetingDescription
		apiBody["properties"].(map[string]interface{})["hs_meeting_start_time"] = meetingStartTime
		apiBody["properties"].(map[string]interface{})["hs_meeting_end_time"] = meetingEndTime
		if assignedTo != "" {
			apiBody["properties"].(map[string]interface{})["hubspot_owner_id"] = assignedTo
		}
		fromObjectType = "meetings"
	case "EMAIL":
		apiBody["properties"].(map[string]interface{})["hs_timestamp"] = time.Now().Format(time.RFC3339)
		apiBody["properties"].(map[string]interface{})["hs_email_direction"] = "EMAIL"
		apiBody["properties"].(map[string]interface{})["hs_email_sender_email"] = emailSenderAddress
		apiBody["properties"].(map[string]interface{})["hs_email_sender_firstname"] = emailSenderFirstname
		apiBody["properties"].(map[string]interface{})["hs_email_sender_lastname"] = emailSenderLastname
		apiBody["properties"].(map[string]interface{})["hs_email_to_email"] = emailRecipientAddress
		apiBody["properties"].(map[string]interface{})["hs_email_subject"] = emailSubject
		if emailHtml != "" {
			apiBody["properties"].(map[string]interface{})["hs_email_html"] = emailHtml
		} else {
			apiBody["properties"].(map[string]interface{})["hs_email_text"] = emailText
		}
		if assignedTo != "" {
			apiBody["properties"].(map[string]interface{})["hubspot_owner_id"] = assignedTo
		}
		fromObjectType = "emails"
	case "CALL":
		apiBody["properties"].(map[string]interface{})["hs_timestamp"] = time.Now().Format(time.RFC3339)
		apiBody["properties"].(map[string]interface{})["hs_call_from_number"] = callFromNumber
		apiBody["properties"].(map[string]interface{})["hs_call_to_number"] = callToNumber
		apiBody["properties"].(map[string]interface{})["hs_call_status"] = callStatus
		apiBody["properties"].(map[string]interface{})["hs_call_body"] = callBody
		if assignedTo != "" {
			apiBody["properties"].(map[string]interface{})["hubspot_owner_id"] = assignedTo
		}
		fromObjectType = "calls"
	default:
		err := errors.New("engagement type should be one of these values: NOTE, MEETING, EMAIL, CALL")
		resp.Successfull = false
		resp.Status = "failed"
		return resp, err
	}

	objs, err := getAssociationObjects(fromObjectType, "contacts", accessToken, strings.Split(contactIdList, ","))
	if err != nil {
		resp.Successfull = false
		resp.Status = "failed"
		return resp, err
	}
	associations = append(associations, objs...)

	objs, err = getAssociationObjects(fromObjectType, "companies", accessToken, strings.Split(companyIdList, ","))
	if err != nil {
		resp.Successfull = false
		resp.Status = "failed"
		return resp, err
	}
	associations = append(associations, objs...)

	objs, err = getAssociationObjects(fromObjectType, "deals", accessToken, strings.Split(dealIdList, ","))
	if err != nil {
		resp.Successfull = false
		resp.Status = "failed"
		return resp, err
	}
	associations = append(associations, objs...)

	objs, err = getAssociationObjects(fromObjectType, "tickets", accessToken, strings.Split(ticketIdList, ","))
	if err != nil {
		resp.Successfull = false
		resp.Status = "failed"
		return resp, err
	}
	associations = append(associations, objs...)

	apiBody["associations"] = associations
	jsonData, err := json.Marshal(apiBody)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
	}
	payload := bytes.NewBuffer(jsonData)
	var url string
	switch strings.ToUpper(engagementType) {
	case "NOTE":
		url = "https://api.hubapi.com/crm/v3/objects/notes"
	case "MEETING":
		url = "https://api.hubapi.com/crm/v3/objects/meetings"
	case "EMAIL":
		url = "https://api.hubapi.com/crm/v3/objects/emails"
	case "CALL":
		url = "https://api.hubapi.com/crm/v3/objects/calls"
	default:
		err := errors.New("engagement type should be one of these values: NOTE, MEETING, EMAIL, CALL")
		resp.Successfull = false
		resp.Status = "failed"
		return resp, err
	}
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", accessToken),
		},
	}

	out, statusCode, _, err := httpRequest(http.MethodPost, url, payload, headers, 0)
	fmt.Println("HubSpot api status code:", statusCode)
	fmt.Println("HubSpot api response (create new engagement):", string(out))
	if err != nil || (statusCode != http.StatusOK && statusCode != http.StatusCreated) {
		fmt.Printf("can't get correct response from HubSpot api")
		resp.Successfull = false
	}
	outMap := make(map[string]interface{})
	json.Unmarshal(out, &outMap)

	resp.ReturnValue = map[string]interface{}{
		"outputs": outMap,
	}
	if resp.Successfull {
		resp.Status = "completed"
		fmt.Println("Engagement created successfully")
	} else {
		resp.Status = "failed"
		fmt.Println("Engagement can't be created successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func getAssociationObjects(fromObjectType, toObjectType, accessToken string, objectIdList []string) ([]map[string]interface{}, error) {
	typeId, err := getAssociationTypeId(fromObjectType, toObjectType, accessToken)
	if err != nil {
		return nil, err
	}
	res := make([]map[string]interface{}, 0)
	for _, objId := range objectIdList {
		objIdInt, err := strconv.Atoi(objId)
		if err != nil {
			return nil, err
		}
		res = append(res, map[string]interface{}{
			"to": map[string]interface{}{
				"id": objIdInt,
			},
			"types": []map[string]interface{}{
				map[string]interface{}{
					"associationCategory": "HUBSPOT_DEFINED",
					"associationTypeId":   typeId,
				},
			},
		})
	}
	return res, nil
}

func getAssociationTypeId(fromObjectType, toObjectType, accessToken string) (int, error) {
	url := fmt.Sprintf("https://api.hubapi.com/crm/v3/associations/%s/%s/types", fromObjectType, toObjectType)
	headers := []Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", accessToken),
		},
	}
	out, statusCode, _, err := httpRequest(http.MethodGet, url, nil, headers, 0)
	if err != nil || statusCode != http.StatusOK {
		fmt.Printf("can't get correct response from HubSpot api")
		if err == nil {
			err = errors.New("not ok with status " + fmt.Sprint(statusCode))
		}
		return 0, err
	}
	outMap := make(map[string]interface{})
	json.Unmarshal(out, &outMap)
	typeId := outMap["results"].([]interface{})[0].(map[string]interface{})["id"]
	typeIdInt, err := strconv.Atoi(fmt.Sprint(typeId))
	if err != nil {
		return 0, err
	}
	return typeIdInt, nil
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
