package database

import (
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (dc *DatabaseController) SetWriteToTableAccess() gin.HandlerFunc {
	return func(c *gin.Context) {
		tableName := c.Param("table_name")
		projectName := c.Param("project_name")
		accountId, _ := utils.GetAccountId(c)

		var dto struct {
			IsWritePublic bool `json:"isWritePublic"`
		}
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		fmt.Println(dto)

		err := dc.Service.SetWriteToTableAccess(accountId, projectName, tableName, dto.IsWritePublic)
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

		c.JSON(200, gin.H{"message": "Table access changed successfully"})

	}
}
