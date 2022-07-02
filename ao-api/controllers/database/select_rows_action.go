package database

import (
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/gin-gonic/gin"
)

/*
Usage:

	curl -X POST -H "Content-Type: application/json" -d '{
		"columns": ["column_name1", "column_name2"]
	}' http://localhost:3004/database/query/select/project/<project_tag>/table/<table_name>

*/

func (dc *DatabaseController) SelectRows() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")
		tableName := c.Param("table_name")

		page, err := strconv.Atoi(c.GetHeader("page"))
		if err != nil {
			page = 1
		}

		size, err := strconv.Atoi(c.GetHeader("size"))
		if err != nil {
			size = 10
		}

		var dto selectDto
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		rows, err := dc.Service.SelectRows(projectTag, tableName, dto.Columns, dto.Filters, page, size)
		if err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.JSON(200, rows)

	}
}

type selectDto struct {
	Columns []string                     `json:"columns"`
	Filters databaseStore.ConditionGroup `json:"filters,omitempty"`
}
