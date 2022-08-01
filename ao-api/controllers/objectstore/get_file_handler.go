package objectstore

import (
	"net/http"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *ObjectstoreController) GetFile() gin.HandlerFunc {
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

		var accountId, tpAccountId string
		tpAccountId = c.Query("tp_account_id") // If user wants to get file uploaded with a tp token they have to pass tp_account_id. This is provided to them in the list files endpoint.

		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}
		if a, ok := c.Get("tpAccountId"); ok { // This overwrites the tpAccountId if request is coming with tp token.
			tpAccountId = a.(string)
		}

		// If the request is sent with a tp token, we assume it's a request for a file with uploader access.
		var sb strings.Builder
		sb.WriteString(accountId + "/")
		if tpAccountId != "" {
			sb.WriteString(tpAccountId + "/")
		}
		sb.WriteString(projectTag + "/")
		sb.WriteString(fileName)

		response, err := svc.GetObject(&s3.GetObjectInput{
			Bucket: aws.String(config.Configs.Upload.S3Bucket),
			Key:    aws.String(sb.String()),
		})
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.DataFromReader(http.StatusOK, *response.ContentLength, *response.ContentType, response.Body, nil)

	}
}
