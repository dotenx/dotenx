package projectService

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	awsScheduler "github.com/aws/aws-sdk-go/service/scheduler"
	"github.com/dotenx/dotenx/ao-api/config"
)

func (ps *projectService) CreateEventBridgeScheduleForDomainRegistration(accountId, projectTag, domainName, operationId string) (err error) {
	// Create a new AWS session
	awsRegion := config.Configs.Secrets.AwsRegion
	accessKeyId := config.Configs.Secrets.AwsAccessKeyId
	secretAccessKey := config.Configs.Secrets.AwsSecretAccessKey
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region:      &awsRegion,
			Credentials: credentials.NewStaticCredentials(accessKeyId, secretAccessKey, string("")),
		},
	}))

	scheduleName := fmt.Sprintf("dtx_domain_registration_%s", projectTag)
	payloadMap := map[string]interface{}{
		"account_id":    accountId,
		"project_tag":   projectTag,
		"domain_name":   domainName,
		"operation_id":  operationId,
		"schedule_name": scheduleName,
		"auth_token":    config.Configs.Secrets.EventSchedulerToken,
	}
	payloadBytes, _ := json.Marshal(payloadMap)
	payloadStr := string(payloadBytes)
	// Create a new EventBridge client
	client := awsScheduler.New(sess)

	_, err = client.CreateSchedule(&awsScheduler.CreateScheduleInput{
		Name:               aws.String(scheduleName),
		State:              aws.String(awsScheduler.ScheduleStateEnabled),
		ScheduleExpression: aws.String(config.Configs.App.DomainRegistrationCheckRate),
		FlexibleTimeWindow: &awsScheduler.FlexibleTimeWindow{
			Mode: aws.String(awsScheduler.FlexibleTimeWindowModeOff),
		},
		Target: &awsScheduler.Target{
			Arn:     aws.String(config.Configs.Secrets.DomainRegistrationTargetArn),
			RoleArn: aws.String(config.Configs.Secrets.EventSchedulerRoleArn),
			Input:   aws.String(payloadStr),
		},
	})
	return
}
