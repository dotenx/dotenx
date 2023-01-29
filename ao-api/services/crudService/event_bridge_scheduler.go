package crudService

import (
	"encoding/json"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	awsScheduler "github.com/aws/aws-sdk-go/service/scheduler"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

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
		ScheduleExpression: aws.String(config.Configs.App.ExecutionTriggerRate),
		FlexibleTimeWindow: &awsScheduler.FlexibleTimeWindow{
			Mode: aws.String(awsScheduler.FlexibleTimeWindowModeOff),
		},
		Target: &awsScheduler.Target{
			Arn:     aws.String(config.Configs.Secrets.EventSchedulerTargetArn),
			RoleArn: aws.String(config.Configs.Secrets.EventSchedulerRoleArn),
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
		ClientToken: aws.String(utils.RandStringRunes(32, utils.FullRunes)),
		Name:        aws.String(schedulerName),
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
		ScheduleExpression: aws.String(config.Configs.App.ExecutionTriggerRate),
		FlexibleTimeWindow: &awsScheduler.FlexibleTimeWindow{
			Mode: aws.String(awsScheduler.FlexibleTimeWindowModeOff),
		},
		Target: &awsScheduler.Target{
			Arn:     aws.String(config.Configs.Secrets.EventSchedulerTargetArn),
			RoleArn: aws.String(config.Configs.Secrets.EventSchedulerRoleArn),
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
		ScheduleExpression: aws.String(config.Configs.App.ExecutionTriggerRate),
		FlexibleTimeWindow: &awsScheduler.FlexibleTimeWindow{
			Mode: aws.String(awsScheduler.FlexibleTimeWindowModeOff),
		},
		Target: &awsScheduler.Target{
			Arn:     aws.String(config.Configs.Secrets.EventSchedulerTargetArn),
			RoleArn: aws.String(config.Configs.Secrets.EventSchedulerRoleArn),
			Input:   aws.String(payloadStr),
		},
	})
	return
}
