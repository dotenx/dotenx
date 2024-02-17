package utils

import (
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/route53"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/sirupsen/logrus"
)

func UpsertRoute53Record(domain, value, hostedZoneId, recordType string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := route53.New(session.New(), cfg)

	var resourceRecordSet *route53.ResourceRecordSet

	if recordType == "Alias" {
		resourceRecordSet = &route53.ResourceRecordSet{
			AliasTarget: &route53.AliasTarget{
				DNSName:              aws.String(value),
				EvaluateTargetHealth: aws.Bool(false),
				HostedZoneId:         aws.String("Z2FDTNDATAQYW2"), // CloudFront hosted zone id. Doesn't change
			},
			Name: aws.String(domain + "."),
			Type: aws.String("A"),
		}
	} else {
		resourceRecordSet = &route53.ResourceRecordSet{
			Name: aws.String(domain + "."),
			Type: aws.String("CNAME"),
			ResourceRecords: []*route53.ResourceRecord{
				{
					Value: aws.String(value),
				},
			},
			TTL: aws.Int64(300),
		}
	}
	upsert := []*route53.Change{{
		Action:            aws.String("UPSERT"), // Must be UPSERT
		ResourceRecordSet: resourceRecordSet,
	}}

	// Put it into a pretty envelope with a stamp for route53#zoneId and change ticket
	params := route53.ChangeResourceRecordSetsInput{
		ChangeBatch: &route53.ChangeBatch{
			Changes: upsert,
		},
		HostedZoneId: aws.String(hostedZoneId),
	}

	// Post it
	_, err := svc.ChangeResourceRecordSets(&params)

	if err != nil {
		logrus.Error(err.Error())
	}
	return err
}

func CreateHostedZone(externalDomain string) (hostedZoneId string, nsRecords []string, err error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := route53.New(session.New(), cfg)

	input := &route53.CreateHostedZoneInput{
		Name:            aws.String(externalDomain),
		CallerReference: aws.String(externalDomain),
		HostedZoneConfig: &route53.HostedZoneConfig{
			Comment: aws.String("Created by dotenx"),
		},
	}
	result, err := svc.CreateHostedZone(input)
	if err != nil {
		return "", nil, err
	}
	nsRecords = make([]string, 0)
	for _, record := range result.DelegationSet.NameServers {
		nsRecords = append(nsRecords, *record)
	}

	hostedZoneId = strings.TrimLeft(*result.HostedZone.Id, "/hostedzone/")

	return hostedZoneId, nsRecords, nil
}
