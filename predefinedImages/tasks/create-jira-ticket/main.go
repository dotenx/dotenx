package main

import (
	"errors"
	"os"
	"strings"

	jira "github.com/andygrunwald/go-jira"
)

func main() {
	access_token := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	project_key := os.Getenv("project_key")
	issueType := os.Getenv("issue_type")
	description := os.Getenv("description")
	summery := os.Getenv("summery")
	jiraUrl := os.Getenv("jira_url")
	err := CreateTicket(project_key, issueType, description, summery, jiraUrl, access_token)
	if err != nil {
		panic(err)
	}

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
