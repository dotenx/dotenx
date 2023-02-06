package triggerService

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	awsScheduler "github.com/aws/aws-sdk-go/service/scheduler"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (manager *TriggerManager) CreateEventBridgeScheduler(trigger models.EventTrigger) (err error) {
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
		"pipeline_endpoint": trigger.Endpoint,
		"auth_token":        config.Configs.Secrets.EventSchedulerToken,
	}
	payloadBytes, _ := json.Marshal(payloadMap)
	payloadStr := string(payloadBytes)
	// Create a new EventBridge client
	client := awsScheduler.New(sess)
	schedulerName := fmt.Sprintf("dtx_%s_%s", trigger.Endpoint, trigger.Name)

	_, err = client.CreateSchedule(&awsScheduler.CreateScheduleInput{
		Name:               aws.String(schedulerName),
		State:              aws.String(awsScheduler.ScheduleStateDisabled),
		ScheduleExpression: aws.String(trigger.Credentials["frequency"].(string)),
		FlexibleTimeWindow: &awsScheduler.FlexibleTimeWindow{
			Mode: aws.String(awsScheduler.FlexibleTimeWindowModeOff),
		},
		Target: &awsScheduler.Target{
			// Arn:     aws.String(config.Configs.Secrets.EventSchedulerTargetArn),
			RoleArn: aws.String(config.Configs.Secrets.EventSchedulerRoleArn),
			Input:   aws.String(payloadStr),
		},
	})
	return
}

func (manager *TriggerManager) DeleteEventBridgeScheduler(pipelineEndpoint, triggerName string) (err error) {

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

	schedulerName := fmt.Sprintf("dtx_%s_%s", pipelineEndpoint, triggerName)
	_, err = client.DeleteSchedule(&awsScheduler.DeleteScheduleInput{
		ClientToken: aws.String(utils.RandStringRunes(32, utils.FullRunes)),
		Name:        aws.String(schedulerName),
	})
	return
}

func (manager *TriggerManager) EnableAllScheduledTriggers(pipelineEndpoint string) (err error) {

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

	triggers, err := manager.GetAllTriggersForPipelineByEndpoint(pipelineEndpoint)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	for _, trigger := range triggers {
		if trigger.Type != "Schedule" {
			continue
		}
		schedulerName := fmt.Sprintf("dtx_%s_%s", pipelineEndpoint, trigger.Name)
		oldScheduler, err := client.GetSchedule(&awsScheduler.GetScheduleInput{
			Name: aws.String(schedulerName),
		})
		if err != nil {
			return err
		}
		_, err = client.UpdateSchedule(&awsScheduler.UpdateScheduleInput{
			Name:               aws.String(schedulerName),
			State:              aws.String(awsScheduler.ScheduleStateEnabled),
			ScheduleExpression: oldScheduler.ScheduleExpression,
			FlexibleTimeWindow: oldScheduler.FlexibleTimeWindow,
			Target:             oldScheduler.Target,
		})
	}
	return
}

func (manager *TriggerManager) DisableAllScheduledTriggers(pipelineEndpoint string) (err error) {

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

	triggers, err := manager.GetAllTriggersForPipelineByEndpoint(pipelineEndpoint)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	for _, trigger := range triggers {
		if trigger.Type != "Schedule" {
			continue
		}
		schedulerName := fmt.Sprintf("dtx_%s_%s", pipelineEndpoint, trigger.Name)
		oldScheduler, err := client.GetSchedule(&awsScheduler.GetScheduleInput{
			Name: aws.String(schedulerName),
		})
		if err != nil {
			return err
		}
		_, err = client.UpdateSchedule(&awsScheduler.UpdateScheduleInput{
			Name:               aws.String(schedulerName),
			State:              aws.String(awsScheduler.ScheduleStateDisabled),
			ScheduleExpression: oldScheduler.ScheduleExpression,
			FlexibleTimeWindow: oldScheduler.FlexibleTimeWindow,
			Target:             oldScheduler.Target,
		})
	}
	return
}
