package database

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
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

		if err := dc.Service.DeleteTable(accountId, projectName, tableName); err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(200, gin.H{"message": "Table removed successfully"})

	}
}
