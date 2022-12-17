package database

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (dc *DatabaseController) RunDatabaseJob(pService projectService.ProjectService) gin.HandlerFunc {
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

		err = dc.Service.RunDatabaseJob(accountId, projectName, dto.Job)
		if err != nil {
			logrus.Error(err.Error())
			if err == utils.ErrDatabaseJobResultAlreadyExists || err == utils.ErrDatabaseJobIsPending {
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

		c.Status(http.StatusOK)
	}
}
