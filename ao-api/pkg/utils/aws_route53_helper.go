package utils

import (
	"errors"
	"fmt"
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
		CallerReference: aws.String(externalDomain + "_" + GetNewUuid()[:16]),
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

func DeleteAllResourceRecordSets(hostedZoneID string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}

	// Create a Route 53 service client
	svc := route53.New(session.New(), cfg)

	// List all resource record sets in the specified hosted zone
	resp, err := svc.ListResourceRecordSets(&route53.ListResourceRecordSetsInput{
		HostedZoneId: aws.String(hostedZoneID),
	})
	if err != nil {
		return err
	}

	numberOfNonDeletableRecords := 0
	// Delete each resource record set
	for _, rrSet := range resp.ResourceRecordSets {
		_, err := svc.ChangeResourceRecordSets(&route53.ChangeResourceRecordSetsInput{
			HostedZoneId: aws.String(hostedZoneID),
			ChangeBatch: &route53.ChangeBatch{
				Changes: []*route53.Change{
					{
						Action:            aws.String("DELETE"),
						ResourceRecordSet: rrSet,
					},
				},
			},
		})
		if err != nil {
			// we should just continue because we can't delete deafult records
			logrus.Error(err.Error())
			numberOfNonDeletableRecords++
			continue
			// return err
		}
		fmt.Printf("Deleted resource record set: %s\n", *rrSet.Name)
	}

	if numberOfNonDeletableRecords > 2 {
		err := errors.New("there are more than two non-deletable records in the hosted zone")
		logrus.Error(err.Error())
		return err
	}

	return nil
}
