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
	"github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

/*

This handler just controls the is_public property of a file.

*/

func (controller *ObjectstoreController) SetAccess() gin.HandlerFunc {
	return func(c *gin.Context) {
		fileName := c.Param("file_name")
		projectTag := c.Param("project_tag")
		accountId, _ := utils.GetAccountId(c)

		var input struct {
			IsPublic bool `json:"isPublic"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.Status(http.StatusBadRequest)
			return
		}

		var url string
		if input.IsPublic {
			url = fmt.Sprintf("%s/%s", config.Configs.Upload.PublicUrl, fileName)
		} else {
			url = fmt.Sprintf("%s/%s/file/%s", config.Configs.Upload.PrivateUrl, projectTag, fileName)
		}

		err := controller.Service.SetAccess(accountId, projectTag, fileName, url, input.IsPublic)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		err = SetObjectPermission(fileName, input.IsPublic)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, gin.H{"url": url})

	}
}

// This function sets the permission of the actual object on S3
func SetObjectPermission(fileName string, isPublic bool) error {

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	var acl *string
	if isPublic {
		acl = aws.String("public-read")
	} else {
		acl = aws.String("private")
	}

	_, err := svc.PutObjectAcl(&s3.PutObjectAclInput{
		Bucket: aws.String(config.Configs.Upload.S3Bucket),
		Key:    aws.String(fileName),
		ACL:    acl,
	})

	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	return nil
}
