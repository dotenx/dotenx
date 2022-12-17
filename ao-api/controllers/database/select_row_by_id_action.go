package database

import (
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
Usage:

	curl  -H "Content-Type: application/json" http://localhost:3004/database/query/select/project/<project_tag>/table/<table_name>/row/<id>

*/

func (dc *DatabaseController) SelectRowById() gin.HandlerFunc {
	return func(c *gin.Context) {
		projectTag := c.Param("project_tag")
		tableName := c.Param("table_name")
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		tpAccountId, _ := utils.GetThirdPartyAccountId(c)
		rows, err := dc.Service.SelectRowById(tpAccountId, projectTag, tableName, id)
		if err != nil {
			logrus.Error(err)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(200, rows)

	}
}
