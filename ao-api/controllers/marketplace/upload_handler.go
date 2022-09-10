package marketplace

import (
	"fmt"
	"net/http"
	"path/filepath"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

/*
This function uploads a file to S3 bucket of marketplace.

This endpoint is used to upload images for the marketplace items. The users can first upload the image and then use the imageUrl to add the item.
*/

func (controller *MarketplaceController) Upload() gin.HandlerFunc {
	return func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		extension := filepath.Ext(file.Filename)
		fileName := "marketplace/" + uuid.New().String() + extension           // NOTE: We must prefix the file name with the folder name because this is the CloudFront is set up
		url := fmt.Sprintf("%s/%s", config.Configs.Upload.PublicUrl, fileName) // We return this url to the user

		// We always know the file size is less than the limit of int32
		size := int(file.Size)
		if size > config.Configs.Marketplace.MaxFileSize {
			c.JSON(http.StatusBadRequest, gin.H{"error": "File size is too large"})
			return
		}

		f, err := file.Open()
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		}

		defer f.Close()

		err = utils.UploadFileToS3(f, config.Configs.Marketplace.S3Bucket, fileName, int64(size), true)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, gin.H{"fileName": fileName, "url": url})
	}
}
