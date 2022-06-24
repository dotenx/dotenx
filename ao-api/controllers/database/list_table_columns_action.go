package database

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

/*

Usage:

	curl http://localhost:3004/database/projects/:project_name/tables/:table_name/columns

*/

func (dc *DatabaseController) ListTableColumns() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectName := c.Param("project_name")
		tableName := c.Param("table_name")

		columns, err := dc.Service.ListTableColumns(accountId, projectName, tableName)
		if err != nil && err.Error() != "not found" {
			log.Println("error:", err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(200, gin.H{"columns": columns})

	}
}
