package utils

import (
	"errors"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/acm"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/sirupsen/logrus"
)

// RequestCertificate requests a certificate from AWS Certificate Manager and returns the ARN of the certificate plus the validation record name and value
func RequestSubdomainCertificate(fqdn string) (certificateArn, validationRecordName, validationRecordValue string, err error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := acm.New(session.New(), cfg)

	input := &acm.RequestCertificateInput{
		DomainName:       aws.String(fqdn),
		IdempotencyToken: aws.String(strings.Replace(fqdn, ".", "", -1)),
		ValidationMethod: aws.String("DNS"),
		SubjectAlternativeNames: []*string{
			aws.String("*." + fqdn),
		},
		DomainValidationOptions: []*acm.DomainValidationOption{
			{
				DomainName:       aws.String(fqdn),
				ValidationDomain: aws.String(fqdn),
			},
		},
	}
	result, err := svc.RequestCertificate(input)
	if err != nil {
		return
	}

	time.Sleep(time.Second * 10)

	dcIn := &acm.DescribeCertificateInput{
		CertificateArn: result.CertificateArn,
	}
	c, err := svc.DescribeCertificate(dcIn)
	if err != nil {
		return
	}
	if c.Certificate.DomainValidationOptions == nil {
		errMsg := "DomainValidationOptions dose not exists"
		logrus.Error(errMsg)
		return "", "", "", errors.New(errMsg)
	}

	if c.Certificate.DomainValidationOptions[0].ResourceRecord == nil {
		errMsg := "ResourceRecord dose not exists"
		logrus.Error(errMsg)
		return "", "", "", errors.New(errMsg)
	}

	validationRecordName = *c.Certificate.DomainValidationOptions[0].ResourceRecord.Name
	validationRecordValue = *c.Certificate.DomainValidationOptions[0].ResourceRecord.Value

	return *result.CertificateArn, validationRecordName, validationRecordValue, nil
}

func ValidateCertificate(tlsArn string) (bool, error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := acm.New(session.New(), cfg)
	input := &acm.DescribeCertificateInput{
		CertificateArn: aws.String(tlsArn),
	}
	result, err := svc.DescribeCertificate(input)
	if err != nil {
		return false, err
	}
	if result.Certificate.Status == nil {
		return false, nil
	}
	return *result.Certificate.Status == "ISSUED", nil
}
