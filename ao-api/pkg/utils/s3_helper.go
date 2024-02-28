package utils

import (
	bytespkg "bytes"
	"fmt"
	"mime/multipart"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/sirupsen/logrus"
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
		logrus.Error(err.Error())
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
		logrus.Error(err.Error())
		return err
	}

	return nil
}

func UploadByteSliceToS3(fileBytes []byte, bucket string, fileName string, size int64, contentType string) error {

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	// Upload the file to S3
	_, err := svc.PutObject(&s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(fileName),
		Body:        bytespkg.NewReader(fileBytes),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	return nil
}

func DeleteS3Folder(bucket, folder string) error {

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	toDelete, err := svc.ListObjects(&s3.ListObjectsInput{
		Bucket: aws.String(bucket),
		Prefix: aws.String(folder),
	})
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	for _, obj := range toDelete.Contents {
		_, err := svc.DeleteObject(&s3.DeleteObjectInput{
			Bucket: aws.String(bucket),
			Key:    obj.Key,
		})
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
	}

	return err
}

func CopyFile(sourceBucket, destinationBucket string, sourceObjectKey, destinationObjectKey string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	_, err := svc.CopyObject(&s3.CopyObjectInput{
		Bucket:     aws.String(destinationBucket),
		CopySource: aws.String(fmt.Sprintf("%v/%v", sourceBucket, sourceObjectKey)),
		Key:        aws.String(fmt.Sprintf("%v", destinationObjectKey)),
	})
	if err != nil {
		logrus.Printf("Couldn't copy object from %v:%v to %v:%v. Here's why: %v\n",
			sourceBucket, sourceObjectKey, destinationBucket, destinationObjectKey, err)
	}
	return err
}

func GetObjectSize(bucketName, objectKey string) (int64, error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}

	// Create S3 service client.
	svc := s3.New(session.New(), cfg)

	// Prepare input parameters for getObjectMetadata.
	params := &s3.HeadObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	}

	// Get object metadata to retrieve object size.
	resp, err := svc.HeadObject(params)
	if err != nil {
		return 0, err
	}

	// Extract and return the size of the object.
	return *resp.ContentLength, nil
}

func DeleteObject(bucketName, objectKey string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}

	// Create S3 service client.
	svc := s3.New(session.New(), cfg)

	// Prepare input parameters for DeleteObject.
	params := &s3.DeleteObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	}

	// Delete the object.
	_, err := svc.DeleteObject(params)
	if err != nil {
		return err
	}

	logrus.Printf("Object '%s' deleted successfully from bucket '%s'.\n", objectKey, bucketName)
	return nil
}

func MakeObjectPublic(bucketName, objectKey string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}

	// Create S3 service client.
	svc := s3.New(session.New(), cfg)

	// Prepare input parameters for PutObjectAcl.
	params := &s3.PutObjectAclInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
		ACL:    aws.String("public-read"),
	}

	// Set the object ACL to public-read.
	_, err := svc.PutObjectAcl(params)
	if err != nil {
		return err
	}

	logrus.Printf("Object '%s' in bucket '%s' is now public.\n", objectKey, bucketName)
	return nil
}

func GetObjectURL(bucketName, objectKey string, duration time.Duration) (string, error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}

	// Create S3 service client.
	svc := s3.New(session.New(), cfg)

	// Prepare input parameters for GetObjectRequest.
	req, _ := svc.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	})

	// Generate a pre-signed URL for the object with the specified expiration time.
	url, err := req.Presign(duration)
	if err != nil {
		return "", err
	}

	return url, nil
}
