package database

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
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

		var dto map[string]interface{}
		if err := c.ShouldBindJSON(&dto); err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		fmt.Println(dto)
		if _, ok := dto["id"]; ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "you can't change id of a row",
			})
			return
		}
		tokenType, _ := c.Get("tokenType")
		if tokenType == "tp" {
			dto["creator_id"], _ = utils.GetThirdPartyAccountId(c)
		}
		fmt.Println(dto)

		tpAccountId, _ := utils.GetThirdPartyAccountId(c)
		if err := dc.Service.UpdateRow(tpAccountId, projectTag, tableName, id, dto); err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Row updated successfully"})
		return
	}
}
