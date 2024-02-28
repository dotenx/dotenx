package projectService

import (
	"context"
	"errors"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/route53"
	"github.com/aws/aws-sdk-go/service/route53domains"
	awsScheduler "github.com/aws/aws-sdk-go/service/scheduler"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

/*
This function is called every 1 hour to check the status of domain registration.
If domain has been registered successfully we create a certificate for it and then create an
eventbridge rule for checking the certificate's issuance status and trigger an SNS topic target when
it is issued.
*/
func (ps *projectService) HandleDomainRegistration(accountId, projectTag, operationId, scheduleName string) (err error) {
	domainDetails, err := ps.Store.GetProjectDomain(context.Background(), accountId, projectTag)
	if err != nil {
		logrus.Error(err.Error())
		return
	}

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	domainSvc := route53domains.New(session.New(), cfg)
	route53Svc := route53.New(session.New(), cfg)
	schedulerSvc := awsScheduler.New(session.New(), cfg)

	logrus.Info("aws operation id: ", operationId)
	operationDetail, err := domainSvc.GetOperationDetail(&route53domains.GetOperationDetailInput{
		OperationId: aws.String(operationId),
	})
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	logrus.Info("aws operation status: ", *operationDetail.Status)
	domainDetails.RegistrationStatus = *operationDetail.Status
	err = ps.UpsertProjectDomain(domainDetails)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	// If the status is one of the following, it means the process is still waiting so
	// we need to check it in subsequent calls to the HandleDomainRegistration function.
	// possible values: SUBMITTED | IN_PROGRESS | ERROR | SUCCESSFUL | FAILED
	if *operationDetail.Status == "SUBMITTED" || *operationDetail.Status == "IN_PROGRESS" {
		return
	}
	if *operationDetail.Status == "SUCCESSFUL" {
		// find the hosted zone id
		hostedZoneIds, err := route53Svc.ListHostedZones(&route53.ListHostedZonesInput{
			MaxItems: aws.String("10000"),
		})
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		var hostedZoneId string
		found := false
		for _, hz := range hostedZoneIds.HostedZones {
			if *hz.Name == domainDetails.ExternalDomain+"." {
				hostedZoneId = *hz.Id
				hostedZoneId = strings.TrimPrefix(hostedZoneId, "/hostedzone/")
				found = true
			}
		}
		if !found {
			err := errors.New("hosted zone not found")
			logrus.Error(err.Error())
			return err
		}

		certificateArn, validationRecordName, validationRecordValue, err := utils.RequestSubdomainCertificate(domainDetails.ExternalDomain)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		newDomainDetails := domainDetails
		newDomainDetails.TlsArn = certificateArn
		newDomainDetails.TlsValidationRecordName = validationRecordName
		newDomainDetails.TlsValidationRecordValue = validationRecordValue
		newDomainDetails.HostedZoneId = hostedZoneId
		err = ps.UpsertProjectDomain(newDomainDetails)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}

		// add tls validation records to related hosted zone
		err = utils.UpsertRoute53Record(strings.TrimSuffix(validationRecordName, "."), validationRecordValue, hostedZoneId, "CNAME")
		if err != nil {
			logrus.Error(err.Error())
			return err
		}

		err = ps.CreateEventBridgeRuleForCertificateIssuance(accountId, projectTag, certificateArn)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
	}

	// We should disable the schedule
	oldScheduler, err := schedulerSvc.GetSchedule(&awsScheduler.GetScheduleInput{
		Name: aws.String(scheduleName),
	})
	if err != nil {
		logrus.Error(err.Error())
		return
	}
	_, err = schedulerSvc.UpdateSchedule(&awsScheduler.UpdateScheduleInput{
		Name:               aws.String(scheduleName),
		State:              aws.String(awsScheduler.ScheduleStateDisabled),
		ScheduleExpression: oldScheduler.ScheduleExpression,
		FlexibleTimeWindow: oldScheduler.FlexibleTimeWindow,
		Target:             oldScheduler.Target,
	})
	return
}
