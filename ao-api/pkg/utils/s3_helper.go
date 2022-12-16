package utils

import (
	bytespkg "bytes"
	"mime/multipart"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
)

/*
We store the helper functions related to S3 in this file.
*/

// This function uploads a file to S3 bucket. You can specify the bucket name, file name, file size and whether the file is public or not.
func UploadFileToS3(file multipart.File, bucketName, fileName string, size int64, isPublic bool) error {

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
		Bucket: aws.String(bucketName),
		Key:    aws.String(fileName),
		Body:   bytespkg.NewReader(buf),
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
