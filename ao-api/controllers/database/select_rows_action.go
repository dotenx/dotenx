package database

import (
	"log"
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/sirupsen/logrus"
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
		if err := c.ShouldBindBodyWith(&dto, binding.JSON); err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		var jsonValue map[string]interface{}
		if err = c.ShouldBindBodyWith(&jsonValue, binding.JSON); err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		logrus.Info(jsonValue)
		if _, ok := jsonValue["columns"]; ok && len(jsonValue["columns"].([]interface{})) == 0 {
			dto.Columns = []string{"*"}
		}
		tpAccountId, _ := utils.GetThirdPartyAccountId(c)
		rows, err := dc.Service.SelectRows(tpAccountId, projectTag, tableName, dto.Columns, dto.Functions, dto.Filters, page, size)
		if err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(200, rows)

	}
}

type selectDto struct {
	Columns   []string                     `json:"columns"`
	Functions []databaseStore.Function     `json:"functions"`
	Filters   databaseStore.ConditionGroup `json:"filters,omitempty"`
}
