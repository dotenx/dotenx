package project

import (
	"net/http"
	"path/filepath"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

func (pc *ProjectController) UploadLogo() gin.HandlerFunc {
	return func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		const MaxFileSize = 5 * 1024 * 1024 // 5MB

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		extension := filepath.Ext(file.Filename)
		fileName := accountId + "_" + uuid.New().String() + extension

		// We always know the file size is less than the limit of int32
		size := int(file.Size)
		if size > MaxFileSize {
			c.JSON(http.StatusBadRequest, gin.H{"error": "File size is too large"})
			return
		}

		f, err := file.Open()

		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		}

		defer f.Close()

		err = utils.UploadFileToS3(f, config.Configs.Upload.S3LogoBucket, fileName, int64(size), true)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		presignUrl, err := utils.GetObjectURL(config.Configs.Upload.S3LogoBucket, fileName, 24*time.Hour)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"key": fileName,
			"url": presignUrl,
		})
	}
}
