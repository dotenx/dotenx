package crudService

import (
	"encoding/json"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	awsScheduler "github.com/aws/aws-sdk-go/service/scheduler"
	"github.com/dotenx/dotenx/ao-api/config"
)

const rate = "rate(10 minutes)"
const roleArn = "arn:aws:iam::994147050565:role/dotenx-event-bridge-scheduler-role"
const topicArn = "arn:aws:sns:us-east-1:994147050565:call-trigger"

func (cm *crudManager) CreateEventBridgeScheduler(pipelineEndpoint string) (err error) {

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

	payloadMap := map[string]interface{}{
		"pipeline_endpoint": pipelineEndpoint,
		"auth_token":        config.Configs.Secrets.EventSchedulerToken,
	}
	payloadBytes, _ := json.Marshal(payloadMap)
	payloadStr := string(payloadBytes)
	// Create a new EventBridge client
	client := awsScheduler.New(sess)
	schedulerName := "dtx_" + pipelineEndpoint

	_, err = client.CreateSchedule(&awsScheduler.CreateScheduleInput{
		Name:               &schedulerName,
		State:              aws.String(awsScheduler.ScheduleStateDisabled),
		ScheduleExpression: aws.String(rate),
		FlexibleTimeWindow: &awsScheduler.FlexibleTimeWindow{
			Mode: aws.String(awsScheduler.FlexibleTimeWindowModeOff),
		},
		Target: &awsScheduler.Target{
			Arn:     aws.String(topicArn),
			RoleArn: aws.String(roleArn),
			Input:   aws.String(payloadStr),
		},
	})
	return
}

func (cm *crudManager) DeleteEventBridgeScheduler(pipelineEndpoint string) (err error) {

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

	// Create a new EventBridge client
	client := awsScheduler.New(sess)

	schedulerName := "dtx_" + pipelineEndpoint
	_, err = client.DeleteSchedule(&awsScheduler.DeleteScheduleInput{
		Name: aws.String(schedulerName),
	})
	return
}

func (cm *crudManager) EnableEventBridgeScheduler(pipelineEndpoint string) (err error) {

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

	payloadMap := map[string]interface{}{
		"pipeline_endpoint": pipelineEndpoint,
		"auth_token":        config.Configs.Secrets.EventSchedulerToken,
	}
	payloadBytes, _ := json.Marshal(payloadMap)
	payloadStr := string(payloadBytes)
	// Create a new EventBridge client
	client := awsScheduler.New(sess)

	schedulerName := "dtx_" + pipelineEndpoint
	_, err = client.UpdateSchedule(&awsScheduler.UpdateScheduleInput{
		Name:               &schedulerName,
		State:              aws.String(awsScheduler.ScheduleStateEnabled),
		ScheduleExpression: aws.String(rate),
		FlexibleTimeWindow: &awsScheduler.FlexibleTimeWindow{
			Mode: aws.String(awsScheduler.FlexibleTimeWindowModeOff),
		},
		Target: &awsScheduler.Target{
			Arn:     aws.String(topicArn),
			RoleArn: aws.String(roleArn),
			Input:   aws.String(payloadStr),
		},
	})
	return
}

func (cm *crudManager) DisableEventBridgeScheduler(pipelineEndpoint string) (err error) {

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

	payloadMap := map[string]interface{}{
		"pipeline_endpoint": pipelineEndpoint,
		"auth_token":        config.Configs.Secrets.EventSchedulerToken,
	}
	payloadBytes, _ := json.Marshal(payloadMap)
	payloadStr := string(payloadBytes)
	// Create a new EventBridge client
	client := awsScheduler.New(sess)

	schedulerName := "dtx_" + pipelineEndpoint
	_, err = client.UpdateSchedule(&awsScheduler.UpdateScheduleInput{
		Name:               &schedulerName,
		State:              aws.String(awsScheduler.ScheduleStateDisabled),
		ScheduleExpression: aws.String(rate),
		FlexibleTimeWindow: &awsScheduler.FlexibleTimeWindow{
			Mode: aws.String(awsScheduler.FlexibleTimeWindowModeOff),
		},
		Target: &awsScheduler.Target{
			Arn:     aws.String(topicArn),
			RoleArn: aws.String(roleArn),
			Input:   aws.String(payloadStr),
		},
	})
	return
}
