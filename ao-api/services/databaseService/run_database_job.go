package databaseService

import (
	"context"
	"errors"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ecs"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (ds *databaseService) RunDatabaseJob(accountId, projectName, job string) error {
	noContext := context.Background()

	dbJob, getJobErr := ds.Store.GetDatabaseJob(noContext, accountId, projectName)
	if getJobErr != nil && getJobErr.Error() != "not found" {
		return getJobErr
	}
	if getJobErr != nil && getJobErr.Error() == "not found" {
		newJob := models.DatabaseJob{
			AccountId:               accountId,
			ProjectName:             projectName,
			PgDumpUrl:               "",
			PgDumpUrlExpirationTime: 0,
		}
		err := ds.Store.AddDatabaseJob(noContext, newJob)
		if err != nil {
			return err
		}
		dbJob = newJob
	}

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")
		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := ecs.New(session.New(), cfg)

	switch job {
	case "pg_dump":
		if time.Now().Unix() < dbJob.PgDumpUrlExpirationTime {
			return utils.ErrDatabaseJobResultAlreadyExists
		}
		if dbJob.PgDumpStatus == "pending" {
			return utils.ErrDatabaseJobIsPending
		}
		err := ds.Store.SetDatabaseJobStatus(noContext, accountId, projectName, job, "pending")
		if err != nil {
			return err
		}
		taskInput := ecs.RunTaskInput{
			Cluster:        aws.String("dotenx"),
			TaskDefinition: aws.String("dotenx-pg-dump:2"),
			Overrides: &ecs.TaskOverride{
				ContainerOverrides: []*ecs.ContainerOverride{
					{
						Name: aws.String("test1"),
						Environment: []*ecs.KeyValuePair{
							{
								Name:  aws.String("ACCOUNT_ID"),
								Value: aws.String(accountId),
							},
							{
								Name:  aws.String("PROJECT_NAME"),
								Value: aws.String(projectName),
							},
							{
								Name:  aws.String("DB_NAME"),
								Value: aws.String(utils.GetProjectDatabaseName(accountId, projectName)),
							},
						},
					},
				},
			},
		}
		taskOutput, err := svc.RunTask(&taskInput)
		if err != nil {
			return err
		}
		logrus.Info(taskOutput.GoString())
		return nil
	default:
		return errors.New("invalid job type")
	}
}
