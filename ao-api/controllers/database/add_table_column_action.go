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
		"tableName": "table-name",
		"columnName": "column-name",
		"columnType": "column-type"
	}' http://localhost:3004/database/table/column

*/

func (dc *DatabaseController) AddTableColumn() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)

		var dto addTableColumnDTO
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		fmt.Println(dto)

		if err := dc.Service.AddTableColumn(accountId, dto.ProjectName, dto.TableName, dto.ColumnName, dto.ColumnType); err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(200, gin.H{"message": "Table column created successfully"})

	}
}

type addTableColumnDTO struct {
	ProjectName string `json:"projectName"`
	TableName   string `json:"tableName" binding:"regexp=^[a-zA-Z][a-zA-Z0-9_]*$,min=1,max=30"`
	ColumnName  string `json:"columnName" binding:"regexp=^[a-zA-Z][a-zA-Z0-9_]*$,min=1,max=30"`
	ColumnType  string `json:"columnType" binding:"oneof=yes_no image_address file_address rating url email just_time just_date date_time num short_text long_text link_field"`
}
