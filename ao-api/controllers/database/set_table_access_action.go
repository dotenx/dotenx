package database

import (
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
	SetTableAccess handler is used to set the is_public property of a table.
	Get records of public tables is accessible without token.
*/

func (dc *DatabaseController) SetTableAccess() gin.HandlerFunc {
	return func(c *gin.Context) {
		tableName := c.Param("table_name")
		projectName := c.Param("project_name")
		accountId, _ := utils.GetAccountId(c)

		var dto struct {
			IsPublic bool `json:"isPublic"`
		}
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		fmt.Println(dto)

		if err := dc.Service.SetTableAccess(accountId, projectName, tableName, dto.IsPublic); err != nil {
			logrus.Error("err:", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{"message": "Table access changed successfully"})

	}
}
