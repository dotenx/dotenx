package projectService

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/route53domains"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/sirupsen/logrus"
)

func (ps *projectService) CheckDomainAvailability(domain string) (string, error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := route53domains.New(session.New(), cfg)

	inputParam := &route53domains.CheckDomainAvailabilityInput{
		DomainName: aws.String(domain),
	}

	output, err := svc.CheckDomainAvailability(inputParam)
	if err != nil {
		logrus.Error(err.Error())
		return "", err
	}
	return *output.Availability, nil
}
