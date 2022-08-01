package objectstore

import (
	"net/http"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *ObjectstoreController) GetPublicFile() gin.HandlerFunc {
	return func(c *gin.Context) {

		fileName := c.Param("file_name")
		projectTag := c.Param("project_tag")

		cfg := &aws.Config{
			Region: aws.String(config.Configs.Upload.S3Region),
		}
		if config.Configs.App.RunLocally {
			creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

			cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
		}
		svc := s3.New(session.New(), cfg)

		response, err := svc.GetObject(&s3.GetObjectInput{
			Bucket: aws.String(config.Configs.Upload.S3Bucket),
			Key:    aws.String("public/" + projectTag + "/" + fileName),
		})
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.DataFromReader(http.StatusOK, *response.ContentLength, *response.ContentType, response.Body, nil)

	}
}
