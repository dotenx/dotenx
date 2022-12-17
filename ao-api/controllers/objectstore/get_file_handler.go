package objectstore

import (
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *ObjectstoreController) GetFile() gin.HandlerFunc {
	return func(c *gin.Context) {

		fileName := c.Param("file_name")
		projectTag := c.Param("project_tag")

		accountId, _ := utils.GetAccountId(c)

		var tpAccountId, userGroup string
		hasPermission := false

		if tpAccountId != "" {
			accId, _ := utils.GetThirdPartyAccountId(c)
			tpAccountId = fmt.Sprintf("%v", accId)
			ug, _ := c.Get("userGroup") // We must always set the user_group claim even if it's empty
			userGroup = ug.(string)
		} else {
			hasPermission = true
		}

		// Get the object from the database
		object, err := controller.Service.GetObject(accountId, projectTag, fileName)

		if err != nil {
			if err.Error() == "entity not found" {
				c.JSON(http.StatusNotFound, gin.H{
					"message": "file not found",
				})
				return
			}
			logrus.Error(err.Error())
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		if tpAccountId != "" {
			if object.TpAccountId == tpAccountId { // By default everyone is allowed to download their own files
				hasPermission = true
			} else {
				for _, group := range object.UserGroups {
					if group == userGroup {
						hasPermission = true
						break
					}
				}
			}
		}

		if !hasPermission {
			c.Status(http.StatusForbidden)
			return
		}

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
			Key:    aws.String(object.Key),
		})
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.DataFromReader(http.StatusOK, *response.ContentLength, *response.ContentType, response.Body, nil)

	}
}
