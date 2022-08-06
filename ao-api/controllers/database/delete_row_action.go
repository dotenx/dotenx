package database

import (
	"log"
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

/*
Usage:

	curl -X POST http://localhost:3004/database/query/delete/project/<project_tag>/table/<table_name>/row/id

*/

func (dc *DatabaseController) DeleteRow() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")
		tableName := c.Param("table_name")
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		tpAccountId, _ := utils.GetThirdPartyAccountId(c)

		if err := dc.Service.DeleteRow(tpAccountId, projectTag, tableName, id); err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{"message": "Row deleted successfully"})

	}
}
