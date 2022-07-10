package database

import (
	"fmt"
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

/*
Usage:

	curl -X POST -H "Content-Type: application/json" -d '{
		"column_name": "column_value"
	}' http://localhost:3004/database/query/insert/project/<project_tab>/table/<table_name>


*/

func (dc *DatabaseController) InsertRow() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")
		tableName := c.Param("table_name")

		var dto map[string]interface{}
		if err := c.ShouldBindJSON(&dto); err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		fmt.Println(dto)
		tpAccountId, _ := utils.GetThirdPartyAccountId(c)
		if err := dc.Service.InsertRow(tpAccountId, projectTag, tableName, dto); err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{"message": "Row added successfully"})

	}
}
