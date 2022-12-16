package database

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
Usage:

	curl -X DELETE http://localhost:3004/database/project/:project_name/table/:table_name/column/:column_name

*/

func (dc *DatabaseController) DeleteTableColumn() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)

		projectName := c.Param("project_name")
		tableName := c.Param("table_name")
		columnName := c.Param("column_name")

		err := dc.Service.DeleteTableColumn(accountId, projectName, tableName, columnName)
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

		c.JSON(200, gin.H{"message": "Table column removed successfully"})

	}
}
