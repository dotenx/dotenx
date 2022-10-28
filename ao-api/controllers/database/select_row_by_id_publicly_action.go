package database

import (
	"log"
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (dc *DatabaseController) SelectRowByIdPublicly() gin.HandlerFunc {
	return func(c *gin.Context) {
		projectTag := c.Param("project_tag")
		tableName := c.Param("table_name")
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		isPublic, err := dc.Service.IsTablePublic(projectTag, tableName)
		if err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if !isPublic {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "you have not access to get records",
			})
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
