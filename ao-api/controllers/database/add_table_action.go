package database

import (
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

/*
Usage:

	curl -X POST -H "Content-Type: application/json" -d '{
		"projectName": "project-name",
		"tableName": "table-name"
	}' http://localhost:3004/database/table

*/

func (dc *DatabaseController) AddTable() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)

		var dto addTableDTO
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		fmt.Println(dto)

		if err := dc.Service.AddTable(accountId, dto.ProjectName, dto.TableName); err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(200, gin.H{"message": "Table created successfully"})

	}
}

type addTableDTO struct {
	ProjectName string `json:"projectName"`
	TableName   string `json:"tableName" binding:"regexp=^[a-zA-Z][a-zA-Z0-9_]*$,min=2,max=20"`
}
