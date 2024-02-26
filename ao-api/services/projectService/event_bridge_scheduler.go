package projectService

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	awsScheduler "github.com/aws/aws-sdk-go/service/scheduler"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/sirupsen/logrus"
)

func (ps *projectService) CreateEventBridgeScheduleForDomainRegistration(accountId, projectTag, domainName, operationId string) (err error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")
		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}

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
	client := awsScheduler.New(session.New(), cfg)

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
	if err != nil {
		logrus.Error("Error creating EventBridge schedule:", err.Error())
		return
	}
	return
}

func EventBridgeScheduleExists(scheduleName string) (bool, error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")
		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	// Create a new EventBridge client
	client := awsScheduler.New(session.New(), cfg)

	// Prepare input parameters for GetSchedule.
	params := &awsScheduler.GetScheduleInput{
		Name: &scheduleName,
	}

	// Check if the schedule exists.
	_, err := client.GetSchedule(params)
	if err != nil {
		// If the schedule does not exist, check if the error is due to "ResourceNotFoundException".
		// If it is, it means the schedule does not exist.
		if _, ok := err.(*awsScheduler.ResourceNotFoundException); ok {
			return false, nil
		}
		// If it's another error, return it.
		return false, err
	}

	// If the schedule exists, return true.
	return true, nil
}
