package database

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
Usage:

	curl -X DELETE http://localhost:3004/database/project/:project_name/table/:table_name

*/

func (dc *DatabaseController) DeleteTable() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)

		projectName := c.Param("project_name")
		tableName := c.Param("table_name")

		if utils.ContainsString(utils.UserDatabaseDefaultTables, tableName) {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "you can't delete default tables",
			})
			return
		}

		err := dc.Service.DeleteTable(accountId, projectName, tableName)
		if err != nil {
			logrus.Error(err.Error())
			if err == utils.ErrUserDatabaseNotFound {
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

		c.JSON(200, gin.H{"message": "Table removed successfully"})

	}
}
