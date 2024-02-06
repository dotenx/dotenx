package projectService

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/route53domains"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (ps *projectService) RegisterDomain(accountId, projectTag string) (awsOperationId string, err error) {
	domainDetails, err := ps.Store.GetProjectDomain(context.Background(), accountId, projectTag)
	if err != nil {
		logrus.Error(err.Error())
		return
	}

	projectDetails, err := ps.Store.GetProjectByTag(context.Background(), projectTag)
	if err != nil {
		logrus.Error(err.Error())
		return
	}
	var aiWebsiteConfiguration models.AIWebsiteConfigurationType
	err = json.Unmarshal(projectDetails.AIWebsiteConfiguration, &aiWebsiteConfiguration)
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
	svc := route53domains.New(session.New(), cfg)

	// availability, err := ps.CheckDomainAvailability(domainDetails.ExternalDomain)
	// if err != nil {
	// 	logrus.Error(err.Error())
	// 	return
	// }
	// if availability != "AVAILABLE" {
	// 	err = utils.ErrDomainNotAvailable
	// 	return
	// }

	contactParam := route53domains.ContactDetail{
		AddressLine1: aws.String(aiWebsiteConfiguration.ContactInfo.Address1),
		AddressLine2: aws.String(aiWebsiteConfiguration.ContactInfo.Address2),
		City:         aws.String(aiWebsiteConfiguration.ContactInfo.City),
		ContactType:  aws.String("PERSON"),
		CountryCode:  aws.String(aiWebsiteConfiguration.ContactInfo.Country),
		Email:        aws.String(aiWebsiteConfiguration.ContactInfo.Email),
		FirstName:    aws.String(aiWebsiteConfiguration.ContactInfo.FirstName),
		LastName:     aws.String(aiWebsiteConfiguration.ContactInfo.LastName),
		PhoneNumber:  aws.String(strings.Replace(aiWebsiteConfiguration.ContactInfo.PhoneNumber, " ", ".", 1)),
		State:        aws.String(aiWebsiteConfiguration.ContactInfo.State),
	}
	if strings.HasSuffix(domainDetails.ExternalDomain, ".com.au") {
		contactParam.ContactType = aws.String("COMPANY")
		contactParam.OrganizationName = aws.String(aiWebsiteConfiguration.BusinessName)
		contactParam.ExtraParams = []*route53domains.ExtraParam{
			{
				Name:  aws.String("AU_ID_NUMBER"),
				Value: aws.String(aiWebsiteConfiguration.ContactInfo.AuIdNumber),
			},
			{
				Name:  aws.String("AU_ID_TYPE"),
				Value: aws.String(aiWebsiteConfiguration.ContactInfo.AuIdType),
			},
		}
	}
	registerDomainParam := route53domains.RegisterDomainInput{
		AdminContact:                    &contactParam,
		RegistrantContact:               &contactParam,
		TechContact:                     &contactParam,
		DomainName:                      aws.String(domainDetails.ExternalDomain),
		AutoRenew:                       aws.Bool(true),
		DurationInYears:                 aws.Int64(1),
		PrivacyProtectAdminContact:      aws.Bool(false),
		PrivacyProtectRegistrantContact: aws.Bool(false),
		PrivacyProtectTechContact:       aws.Bool(false),
	}

	output, err := svc.RegisterDomain(&registerDomainParam)
	if err != nil {
		return
	}

	logrus.Info("aws operation id: ", output.OperationId)
	// svc.GetOperationDetail(&route53domains.GetOperationDetailInput{
	// 	OperationId: output.OperationId,
	// })
	awsOperationId = *output.OperationId
	return
}
