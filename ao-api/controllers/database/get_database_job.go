package database

import (
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (dc *DatabaseController) GetDatabaseJob(pService projectService.ProjectService) gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectName := c.Param("project_name")

		type databaseJobDTO struct {
			Job string `json:"job"`
		}
		var dto databaseJobDTO
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid request body",
			})
			return
		}

		project, err := pService.GetProject(accountId, projectName)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "an internal server error occurred",
			})
			return
		}
		if !project.HasDatabase {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "this project has not database",
			})
			return
		}

		dbJob, err := dc.Service.GetDatabaseJob(accountId, projectName)
		if err != nil {
			logrus.Error(err.Error())
			if err.Error() == "not found" {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": "an internal server error occurred",
				})
			}
			return
		}

		switch dto.Job {
		case "pg_dump":
			if dbJob.PgDumpStatus == "" {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "not found",
				})
				return
			}
			if time.Now().Unix() >= dbJob.PgDumpUrlExpirationTime && dbJob.PgDumpStatus == "completed" {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "pg dump url expired",
				})
				return
			}
		case "csv":
			if dbJob.CsvStatus == "" {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "not found",
				})
				return
			}
			if time.Now().Unix() >= dbJob.CsvUrlExpirationTime && dbJob.CsvStatus == "completed" {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "csv url expired",
				})
				return
			}
		default:
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid database job type",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"db_job": dbJob,
		})
	}
}
