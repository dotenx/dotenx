package database

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
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
		if err != nil {
			logrus.Error(err.Error())
			if err == utils.ErrUserDatabaseNotFound {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			} else if err.Error() != "not found" {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": "an internal server error occurred",
				})
				return
			}
		}

		c.JSON(200, gin.H{"columns": columns})

	}
}
