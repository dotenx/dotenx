package main

import (
	"errors"
	"fmt"
	"strings"

	jira "github.com/andygrunwald/go-jira"
	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	AccessToken string `json:"INTEGRATION_ACCESS_TOKEN"`
	ProjectKey  string `json:"project_key"`
	IssueType   string `json:"issue_type"`
	Description string `json:"description"`
	Summery     string `json:"summery"`
	JiraUrl     string `json:"jira_url"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	resp := Response{}
	access_token := event.AccessToken
	project_key := event.ProjectKey
	issueType := event.IssueType
	description := event.Description
	summery := event.Summery
	jiraUrl := event.JiraUrl
	err := CreateTicket(project_key, issueType, description, summery, jiraUrl, access_token)
	if err != nil {
		fmt.Println(err.Error())
		resp.Successfull = false
		return resp, err
	}
	fmt.Println("ticket creation done successfully")
	resp.Successfull = true
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func CreateTicket(ProjectKey, issueType, description, summery, jiraUrl, accessToken string) error {
	base := jiraUrl
	credentials := strings.Split(accessToken, ":")
	if len(credentials) != 2 {
		return errors.New("invalid integration for jira")
	}
	tp := jira.BasicAuthTransport{
		Username: credentials[0],
		Password: credentials[1],
	}

	jiraClient, err := jira.NewClient(tp.Client(), base)
	if err != nil {
		return err
	}
	i := jira.Issue{
		Fields: &jira.IssueFields{
			Description: description,
			Type: jira.IssueType{
				Name: issueType,
			},
			Project: jira.Project{
				Key: ProjectKey,
			},
			Summary: summery,
		},
	}
	_, _, err = jiraClient.Issue.Create(&i)
	if err != nil {
		return err
	}
	return nil
}
