package objectstore

import (
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

/*
This function uploads a file to S3, adds the record to objectstore table and returns the url of the file.

The request MUST send a file, and optionally can contain is_public and user_groups.

If is_public is true, the file's ACL permission on S3 will be set to public-read. By default, it is set to private.

Also, when is_public is true, we return the public url of the file served through CloudFront, otherwise, we return the private url of the file being served by our server.
*/

func (controller *ObjectstoreController) DeleteFile() gin.HandlerFunc {
	return func(c *gin.Context) {

		accountId, _ := utils.GetAccountId(c)
		tpAccountId, _ := utils.GetThirdPartyAccountId(c)

		projectTag := c.Param("project_tag")
		fileName := c.Param("file_name")

		err := controller.Service.DeleteObject(accountId, tpAccountId, projectTag, fileName)
		if err != nil {
			if err.Error() == "entity not found" {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// We do this here to make sure use had the permission to delete the file (we've reached here without error)
		err = deleteFileFromS3(fileName)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "File deleted successfully"})
	}

}

func deleteFileFromS3(fileName string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	// Delete the file to S3
	_, err := svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(config.Configs.Upload.S3Bucket),
		Key:    aws.String(fileName),
	})
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	return nil
}
