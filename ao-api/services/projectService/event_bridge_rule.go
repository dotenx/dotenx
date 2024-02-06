package projectService

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cloudwatchevents"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (ps *projectService) CreateEventBridgeRuleForCertificateIssuance(accountId, projectTag, certificateArn string) (err error) {
	// Create a new AWS session
	// awsRegion := config.Configs.Secrets.AwsRegion
	// accessKeyId := config.Configs.Secrets.AwsAccessKeyId
	// secretAccessKey := config.Configs.Secrets.AwsSecretAccessKey
	// sess := session.Must(session.NewSessionWithOptions(session.Options{
	// 	Config: aws.Config{
	// 		Region:      &awsRegion,
	// 		Credentials: credentials.NewStaticCredentials(accessKeyId, secretAccessKey, string("")),
	// 	},
	// }))

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
				Id:  aws.String(utils.GetNewUuid()),
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
