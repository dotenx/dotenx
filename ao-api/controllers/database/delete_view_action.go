package database

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (dc *DatabaseController) DeleteView() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectName := c.Param("project_name")
		viewName := c.Param("view_name")

		if err := dc.Service.DeleteView(accountId, projectName, viewName); err != nil {
			logrus.Error(err.Error())
			if err.Error() == "not found" || err == utils.ErrUserDatabaseNotFound {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "an internal server error occurred",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "View removed successfully",
		})
	}
}
