package database

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
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

		if err := dc.Service.DeleteTableColumn(accountId, projectName, tableName, columnName); err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(200, gin.H{"message": "Table column removed successfully"})

	}
}
