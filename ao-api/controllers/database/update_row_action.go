package database

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

/*
Usage:

	curl -X POST -H "Content-Type: application/json" -d '{
		"column_name": "column_value"
	}' http://localhost:3004/database/query/update/project/<project_tag>/table/<table_name>/row/<id>


*/

func (dc *DatabaseController) UpdateRow() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")
		tableName := c.Param("table_name")
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		var dto map[string]string
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		fmt.Println(dto)
		if _, ok := dto["id"]; ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "you can't change id of a row",
			})
			return
		}

		if err := dc.Service.UpdateRow(projectTag, tableName, id, dto); err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Row updated successfully"})
		return
	}
}
