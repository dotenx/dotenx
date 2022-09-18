package marketplaceService

import (
	"errors"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sts"
	"github.com/dotenx/dotenx/ao-api/config"
)

func (ps *marketplaceService) GetTemporaryCredential(useCase, accountId string) (creds sts.Credentials, err error) {
	switch useCase {
	case "deploy_function":
		cfg := &aws.Config{
			Region: aws.String(config.Configs.Secrets.AwsRegion),
		}
		if config.Configs.App.RunLocally {
			creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

			cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
		}
		svc := sts.New(session.New(), cfg)
		stsOutput, stsErr := svc.AssumeRole(&sts.AssumeRoleInput{
			DurationSeconds: aws.Int64(900),
			RoleArn:         aws.String(config.Configs.Secrets.DeployFunctionRoleArn),
			RoleSessionName: aws.String(accountId),
		})
		if stsErr != nil {
			return sts.Credentials{}, stsErr
		}
		creds = *stsOutput.Credentials
		return
	default:
		return sts.Credentials{}, errors.New("unsupported use case")
	}

}
