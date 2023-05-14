package databaseService

import (
	"bytes"
	"mime/multipart"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ecs"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (ds *databaseService) ImportCsvFile(file *multipart.FileHeader, accountId string, projectName string, projectTag string, tableName string) error {
	f, err := file.Open()
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	defer f.Close()

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")
		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := ecs.New(session.New(), cfg)

	fileName := "temp_" + utils.RandStringRunes(16, utils.FullRunes) + ".csv"
	err = UploadFileToS3(f, fileName, file.Size, false)
	if err != nil {
		return err
	}
	dbUser, err := ds.Store.GetDatabaseUser(noContext, accountId, projectName)
	if err != nil {
		return err
	}
	encryptedUsername := dbUser.Username
	username, err := utils.Decrypt(encryptedUsername, config.Configs.Secrets.Encryption)
	if err != nil {
		return err
	}
	encryptedPassword := dbUser.Password
	password, err := utils.Decrypt(encryptedPassword, config.Configs.Secrets.Encryption)
	if err != nil {
		return err
	}

	taskInput := ecs.RunTaskInput{
		Cluster:        aws.String("dotenx"),
		TaskDefinition: aws.String("dotenx-import-csv:1"),
		Overrides: &ecs.TaskOverride{
			ContainerOverrides: []*ecs.ContainerOverride{
				{
					Name: aws.String("test3"),
					Environment: []*ecs.KeyValuePair{
						{
							Name:  aws.String("CSV_FILE_NAME"),
							Value: aws.String(fileName),
						},
						{
							Name:  aws.String("TABLE_NAME"),
							Value: aws.String(tableName),
						},
						{
							Name:  aws.String("DB_NAME"),
							Value: aws.String(utils.GetProjectDatabaseName(accountId, projectName)),
						},
						{
							Name:  aws.String("DB_USERNAME"),
							Value: aws.String(username),
						},
						{
							Name:  aws.String("PGPASSWORD"),
							Value: aws.String(password),
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
}

// simple utility function
func UploadFileToS3(file multipart.File, fileName string, size int64, isPublic bool) error {

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	buf := make([]byte, size)
	_, err := file.Read(buf)
	if err != nil {
		return err
	}

	pubObjectParam := &s3.PutObjectInput{
		Bucket: aws.String(config.Configs.Secrets.ImportCsvS3Bucket),
		Key:    aws.String(fileName),
		Body:   bytes.NewReader(buf),
	}

	if isPublic {
		pubObjectParam.ACL = aws.String("public-read")
	} else {
		pubObjectParam.ACL = aws.String("private")
	}

	// Upload the file to S3
	_, err = svc.PutObject(pubObjectParam)
	if err != nil {
		return err
	}

	return nil
}
