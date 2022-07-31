package main

import (
	"errors"
	"fmt"
	"strings"

	jira "github.com/andygrunwald/go-jira"
	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	Body map[string]interface{} `json:"body"`
}

// type Event struct {
// 	AccessToken string `json:"INTEGRATION_ACCESS_TOKEN"`
// 	ProjectKey  string `json:"project_key"`
// 	IssueType   string `json:"issue_type"`
// 	Description string `json:"description"`
// 	Summery     string `json:"summery"`
// 	JiraUrl     string `json:"jira_url"`
// }

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	for _, val := range event.Body {
		singleInput := val.(map[string]interface{})
		project_key := singleInput["project_key"].(string)
		issueType := singleInput["issue_type"].(string)
		description := singleInput["description"].(string)
		summery := singleInput["summery"].(string)
		jiraUrl := singleInput["jira_url"].(string)
		access_token := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
		if access_token == "" {
			fmt.Println("no api key")
			// resp.Successfull = false
			// return resp, errors.New("there isn't any api key")
			continue
		}
		err := CreateTicket(project_key, issueType, description, summery, jiraUrl, access_token)
		if err != nil {
			fmt.Println(err.Error())
			// resp.Successfull = false
			// return resp, err
			fmt.Printf("creating jira ticket wasn't successful\n")
			continue
		} else {
			fmt.Printf("creating jira ticket was successful\n")
			resp.Successfull = true
		}
	}
	if resp.Successfull {
		fmt.Println("All/some email(s) send successfully")
	}
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
