package database

import (
	"net/http"
	"path/filepath"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

const MaxFileSize = int64(1 * 1024 * 1024)

func (dc *DatabaseController) ImportCsvFile(pService projectService.ProjectService) gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectTag := c.Param("project_tag")
		tableName := c.Param("table_name")

		file, err := c.FormFile("file")
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		extension := filepath.Ext(file.Filename)
		if extension != ".csv" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "file should be in csv format",
			})
			return
		}
		// We always know the file size is less than the limit of int32
		size := file.Size
		if size > MaxFileSize {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "File size is too large",
			})
			return
		}

		project, err := pService.GetProjectByTag(projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "an internal server error occurred",
			})
			return
		}

		err = dc.Service.ImportCsvFile(file, accountId, project.Name, projectTag, tableName)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{
			"message": "rows imported successfully",
		})

	}
}
