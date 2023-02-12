package objectstoreService

import (
	"context"
	"strconv"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/sirupsen/logrus"
)

func (ps *objectstoreService) GetPresignUrl(accountId, projectTag, fileName, expiresIn string) (map[string]interface{}, error) {
	expiresInInt, err := strconv.ParseInt(expiresIn, 10, 64)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}

	_, err = ps.Store.GetObject(context.Background(), accountId, projectTag, fileName)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")
		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	req, _ := svc.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(config.Configs.Upload.S3Bucket),
		Key:    aws.String(fileName),
	})
	urlStr, err := req.Presign(time.Duration(expiresInInt) * time.Second)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}

	return map[string]interface{}{
		"url":         urlStr,
		"valid_until": time.Now().Add(time.Duration(expiresInInt) * time.Second).Format(time.RFC3339),
	}, nil
}
