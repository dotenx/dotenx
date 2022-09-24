// image: awrmin/create-jira-ticket:lambda5
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
	resp.Successfull = true
	// for _, val := range event.Body {
	singleInput := event.Body
	project_key := singleInput["project_key"].(string)
	issueType := singleInput["issue_type"].(string)
	description := singleInput["description"].(string)
	summery := singleInput["summery"].(string)
	jiraUrl := singleInput["jira_url"].(string)
	access_token := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
	if access_token == "" {
		fmt.Println("Error: There isn't access token, Please check your integration")
		resp.Successfull = false
		// continue
	}
	err := CreateTicket(project_key, issueType, description, summery, jiraUrl, access_token)
	if err != nil {
		fmt.Println(err.Error())
		fmt.Printf("creating jira ticket wasn't successful\n")
		resp.Successfull = false
		// continue
	} else {
		fmt.Printf("creating jira ticket was successful\n")
	}
	// }
	if resp.Successfull {
		fmt.Println("All ticket(s) created successfully")
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
