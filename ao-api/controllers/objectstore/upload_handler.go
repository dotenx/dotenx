package objectstore

import (
	"bytes"
	"fmt"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

/*
This function uploads a file to S3, adds the record to objectstore table and returns the url of the file.

The request MUST send a file, and optionally can contain is_public and user_groups.

If is_public is true, the file's ACL permission on S3 will be set to public-read. By default, it is set to private.

Also, when is_public is true, we return the public url of the file served through CloudFront, otherwise, we return the private url of the file being served by our server.
*/

// Todo: Get this from config
const MaxFileSize = 1 * 1024 * 1024

func (controller *ObjectstoreController) Upload() gin.HandlerFunc {
	return func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var accountId, tpAccountId string

		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}
		if a, ok := c.Get("tpAccountId"); ok {
			tpAccountId = a.(string)
		}
		projectTag := c.Param("project_tag")

		ac := c.PostForm("is_public")
		ug := c.PostForm("user_groups")

		isPublic, err := strconv.ParseBool(ac)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": "is_public must be a boolean"})
			return
		}

		userGroups := strings.Split(ug, ",")
		if len(userGroups) == 1 && userGroups[0] == "" {
			userGroups = []string{}
		}

		extension := filepath.Ext(file.Filename)
		fileName := uuid.New().String() + extension

		// Get the existing usage
		used, err := controller.Service.GetTotalUsage(accountId)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get total usage"})
			return
		}

		// We always know the file size is less than the limit of int32
		size := int(file.Size)
		if size > MaxFileSize {
			c.JSON(http.StatusBadRequest, gin.H{"error": "File size is too large"})
			return
		}

		// Check if the user has enough space
		// TODO: Check this based on user's plan
		totalAllowedSize, err := strconv.Atoi(config.Configs.Upload.QuotaKB)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get total allowed size"})
			return
		}

		if size > (totalAllowedSize - used) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Not enough space"})
			return
		}

		var url string
		if isPublic {
			url = fmt.Sprintf("%s/%s", config.Configs.Upload.PublicUrl, fileName)
		} else {
			url = fmt.Sprintf("%s/%s/file/%s", config.Configs.Upload.PrivateUrl, projectTag, fileName)
		}

		// Prepare the url of the file based on its access
		toAdd := models.Objectstore{
			Key:         fileName,
			AccountId:   accountId,
			TpAccountId: tpAccountId,
			ProjectTag:  projectTag,
			Size:        int(size),
			// Access:      access,
			Url:         url,
			IsPublic:    isPublic,
			UserGroups:  userGroups,
			DisplayName: file.Filename,
		}

		err = controller.Service.AddObject(toAdd)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add new file"})
			return
		}

		f, err := file.Open()

		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		}

		defer f.Close()

		err = UploadFileToS3(f, fileName, int64(size), isPublic)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"fileName":    fileName,
			"url":         url,
			"displayName": toAdd.DisplayName,
		})
	}
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
		Bucket: aws.String(config.Configs.Upload.S3Bucket),
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
