package database

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (dc *DatabaseController) RunDatabaseQuery() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")

		type queryDTO struct {
			Query string `json:"query"`
		}
		var dto queryDTO
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		result, err := dc.Service.RunDatabaseQuery(projectTag, dto.Query)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}
