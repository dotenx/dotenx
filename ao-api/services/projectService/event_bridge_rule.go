package projectService

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cloudwatchevents"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/sirupsen/logrus"
)

func (ps *projectService) CreateEventBridgeRuleForCertificateIssuance(accountId, projectTag, certificateArn string) (err error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")
		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	// Create an EventBridge client
	eventBridgeClient := cloudwatchevents.New(session.New(), cfg)

	// Define the event pattern for certificate creation
	eventPattern := fmt.Sprintf(`{
		"source": ["aws.acm"],
		"detail-type": ["ACM Certificate Available"],
		"resources": [
            "%s"
        ],
		"detail": {
			"Action": ["ISSUANCE"]
		}
	}`, certificateArn)

	// Define the rule details
	ruleName := fmt.Sprintf("dtx_certificate_issuance_%s", projectTag)
	targetArn := config.Configs.Secrets.CertificateIssuanceTargetArn

	// Define the input transformer
	// payloadMap := map[string]interface{}{
	// 	"account_id":  accountId,
	// 	"project_tag": projectTag,
	// 	"auth_token":  config.Configs.Secrets.EventSchedulerToken,
	// }
	// payloadBytes, _ := json.Marshal(payloadMap)
	// payloadStr := string(payloadBytes)

	// Create the EventBridge rule with input transformer
	createRuleInput := &cloudwatchevents.PutRuleInput{
		Name:         aws.String(ruleName),
		EventPattern: aws.String(eventPattern),
		State:        aws.String(cloudwatchevents.RuleStateEnabled),
		RoleArn:      aws.String(config.Configs.Secrets.EventRuleRoleArn),
	}
	_, err = eventBridgeClient.PutRule(createRuleInput)
	if err != nil {
		logrus.Error("Error creating EventBridge rule:", err.Error())
		return
	}

	// Add a target to the rule (e.g., SNS topic) with input transformer
	putTargetsInput := &cloudwatchevents.PutTargetsInput{
		Rule: aws.String(ruleName),
		Targets: []*cloudwatchevents.Target{
			{
				Id:  aws.String("sns_topic"),
				Arn: aws.String(targetArn),
			},
		},
	}
	_, err = eventBridgeClient.PutTargets(putTargetsInput)
	if err != nil {
		logrus.Error("Error adding target to EventBridge rule:", err.Error())
		return
	}

	return
}

func EventBridgeRuleExists(ruleName string) (bool, error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")
		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	// Create an EventBridge client
	eventBridgeClient := cloudwatchevents.New(session.New(), cfg)

	// Prepare input parameters for DescribeRule.
	params := &cloudwatchevents.DescribeRuleInput{
		Name: aws.String(ruleName),
	}

	// Check if the rule exists.
	_, err := eventBridgeClient.DescribeRule(params)
	if err != nil {
		// If the rule does not exist, check if the error is due to "ResourceNotFoundException".
		// If it is, it means the schedule does not exist.
		if _, ok := err.(*cloudwatchevents.ResourceNotFoundException); ok {
			return false, nil
		}
		// If it's another error, return it.
		return false, err
	}

	// If the rule exists, return true.
	return true, nil
}
