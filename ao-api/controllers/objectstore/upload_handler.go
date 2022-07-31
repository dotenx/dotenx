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

		ac := c.PostForm("access")
		var access string
		switch ac {
		case "public":
			access = "public"
			break
		case "uploader":
			if tpAccountId == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid access specified"})
				return
			}
			access = "uploader"
			break
		case "owner":
			access = "owner"
			break
		default:
			access = "owner"
		}

		// Retrieve file information
		extension := filepath.Ext(file.Filename)

		var sb strings.Builder
		// This is how we store the files on S3 based on their access
		if access == "public" {
			sb.WriteString("public/")
		} else if access == "uploader" {
			sb.WriteString(accountId + "/" + tpAccountId + "/")
		} else {
			sb.WriteString(accountId + "/")
		}
		sb.WriteString(projectTag + "/")
		// Generate random file name for the new uploaded file so it doesn't override the old file with same name
		fileName := uuid.New().String() + extension
		sb.WriteString(fileName)
		filePathOnS3 := sb.String()

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

		fmt.Println(config.Configs.Upload.QuotaKB)

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

		toAdd := models.Objectstore{
			Key:         fileName,
			AccountId:   accountId,
			TpAccountId: tpAccountId,
			ProjectTag:  projectTag,
			Size:        int(size),
			Access:      access,
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

		err = UploadFileToS3(f, filePathOnS3, int64(size))
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, gin.H{"file_name": fileName})
	}
}

func UploadFileToS3(file multipart.File, fileName string, size int64) error {

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	buf := make([]byte, size)
	_, err := file.Read(buf)
	if err != nil {
		return err
	}

	// Upload the file to S3
	_, err = svc.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(config.Configs.Upload.S3Bucket),
		Key:    aws.String(fileName),
		Body:   bytes.NewReader(buf),
	})
	if err != nil {
		return err
	}

	return nil
}

//
