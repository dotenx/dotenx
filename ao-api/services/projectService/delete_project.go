package projectService

import (
	"context"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/acm"
	"github.com/aws/aws-sdk-go/service/cloudfront"
	"github.com/aws/aws-sdk-go/service/route53"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/sirupsen/logrus"
)

/*
DeleteProject deletes a project and all its associated resources:
	If the project has domain:
		If the project has an external domain:
			1. Deletes the CloudFront distribution if it exists
			2. Deletes the S3 bucket if it exists
			3. Deletes the Route53 hosted zone if it exists
			4. Deletes the ACM certificate if it exists
		Else:
			Deletes the S3 folder

	Deletes the UI pages records from the database

	Deletes the pipeline records from the database

	Deletes the project record from the database

TODO: Create a scheduled job to delete the actual database associated with the project if there is one (not implemented for now)
TODO: Delete the uploaded files with a scheduled job (it's currently happening here)

ISSUE: With current implementation, as the database is not deleted immediately, if the user creates another database with the same name it'll see the data from the deleted project!
*/

// DeleteProject deletes a project and all its associated resources
func (ps *projectService) DeleteProject(accountId, projectTag string, ubService uibuilderService.UIbuilderService, dbService databaseService.DatabaseService, cService crudService.CrudService) error {

	/// Delete the resources first

	// Get the project domain to understand if the UI pages are published and if yes, where

	projectDomain, err := ps.GetProjectDomain(accountId, projectTag)

	hasDomain := true
	if err != nil {
		if err.Error() == "project_domain not found" {
			hasDomain = false
		} else {
			return err
		}
	}

	if !config.Configs.App.RunLocally && hasDomain {
		// If the project is published with custom domain, delete CloudFront, Route53 Hosted Zone, S3 bucket and ACM certificate
		if projectDomain.ExternalDomain != "" {
			/*
				1. Delete the CloudFront distribution if it exists
				2. Delete the S3 bucket if it exists
				3. Delete the certificate if it exists
				4. Delete the hosted zone if it exists
			*/
			infra, err := ubService.GetUiInfrastructure(accountId, projectTag)
			if err != nil && err.Error() != "not found" {
				logrus.Error(err.Error())
				return err
			} else {
				err := deleteCloudFrontDistribution(infra.CdnArn) // todo: use the distribution id
				if err != nil {
					logrus.Error(err.Error())
					return err
				}
				err = deleteS3Bucket(infra.S3Bucket)
				if err != nil {
					logrus.Error(err.Error())
					return err
				}
				err = deleteCertificate(projectDomain.TlsArn)
				if err != nil {
					logrus.Error(err.Error())
					return err
				}
			}

		} else if projectDomain.InternalDomain != "" {
			// If the project is published with dotenx domain, delete the S3 folder
			bucket := config.Configs.UiBuilder.S3Bucket
			prefix := projectDomain.InternalDomain + ".web" + "/"
			err := utils.DeleteS3Folder(bucket, prefix)
			if err != nil {
				logrus.Error(err.Error())
				return err
			}
		}

		// Delete the project domain record
		err = ps.DeleteProjectDomain(models.ProjectDomain{
			ProjectTag: projectTag,
		}, ubService)

		if err != nil && err.Error() != "entity not found" {
			logrus.Error(err.Error())
			return err
		}
	}

	// Delete the uploaded files
	// TODO: After implementing the necessary changes in the objecstore implement this
	// NOTE: We don't drop the database here and we will do it with a scheduled job.
	// TODO: Implement a scheduled job that finds the list of databases that don't have a database and drops them (hint: utils.GetDbInstance())
	// CAVEAT: If the user deletes a project and creates a new one with the same name, the database will be used if it happens before the scheduled job runs

	// todo: delete the uploaded files with a scheduled job

	/// Delete the records from the database

	// Delete all the pipelines of the project
	project, err := ps.GetProjectByTag(projectTag)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	err = cService.DeleteAllPipelines(accountId, project.Name)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	// Delete all the UI pages from the database
	err = ubService.DeleteAllPages(accountId, projectTag)
	if err != nil {
		if err.Error() != "entity not found" {
			logrus.Error(err.Error())
			return err
		}
	}

	if project.HasDatabase {
		// Drop database of project
		err = dbService.DeleteDatabase(accountId, project.Name)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		// Delete corresponding database user
		err = dbService.DeleteDatabaseUser(accountId, project.Name)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
	}

	err = ps.Store.DeleteProjectByTag(context.Background(), projectTag)
	if err != nil {
		logrus.Error(err.Error())
	}
	return err
}

// Utility functions - not much business logic here
func deleteS3Bucket(bucket string) error {

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	_, err := svc.DeleteBucket(&s3.DeleteBucketInput{
		Bucket: aws.String(bucket),
	})
	if err != nil {
		logrus.Error(err.Error())
	}
	return err
}

func deleteCertificate(certificateArn string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := acm.New(session.New(), cfg)

	_, err := svc.DeleteCertificate(&acm.DeleteCertificateInput{
		CertificateArn: aws.String(certificateArn),
	})

	if err != nil {
		logrus.Error(err.Error())
	}
	return err
}

func deleteHostedZone(hostedZoneId string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := route53.New(session.New(), cfg)

	_, err := svc.DeleteHostedZone(&route53.DeleteHostedZoneInput{
		Id: aws.String(hostedZoneId),
	})

	if err != nil {
		logrus.Error(err.Error())
	}
	return err

}

func deleteRoute53Record(domain, value, hostedZoneId, recordType string) error {
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
				HostedZoneId:         aws.String("Z2FDTNDATAQYW2"), // CloudFront hosted zone id. DOESN'T CHANGE
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
		Action:            aws.String("DELETE"),
		ResourceRecordSet: resourceRecordSet,
	}}

	params := route53.ChangeResourceRecordSetsInput{
		ChangeBatch: &route53.ChangeBatch{
			Changes: upsert,
		},
		HostedZoneId: aws.String(hostedZoneId),
	}

	_, err := svc.ChangeResourceRecordSets(&params)

	if err != nil {
		logrus.Error(err.Error())
	}
	return err
}

func deleteCloudFrontDistribution(distributionId string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}

	cfSvc := cloudfront.New(session.New(), cfg)
	_, err := cfSvc.DeleteDistribution(&cloudfront.DeleteDistributionInput{
		Id: aws.String(distributionId),
	})

	if err != nil {
		logrus.Error(err.Error())
	}
	return err

}
