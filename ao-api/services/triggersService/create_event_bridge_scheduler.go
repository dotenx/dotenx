package triggerService

import (
	"encoding/json"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	awsScheduler "github.com/aws/aws-sdk-go/service/scheduler"
	"github.com/dotenx/dotenx/ao-api/config"
)

func (manager *TriggerManager) CreateEventBridgeScheduler(pipelineEndpoint string) (err error) {

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

	rate := "rate(10 minutes)"
	roleArn := "arn:aws:iam::994147050565:role/dotenx-event-bridge-scheduler-role"
	topicArn := "arn:aws:sns:us-east-1:994147050565:call-trigger"
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
