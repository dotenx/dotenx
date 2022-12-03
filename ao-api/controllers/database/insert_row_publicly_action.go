package database

import (
	"fmt"
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (dc *DatabaseController) InsertRowPublicly() gin.HandlerFunc {
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

		isWritePublic, err := dc.Service.IsWriteToTablePublic(projectTag, tableName)
		if err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if !isWritePublic {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "you have not access to add record(s)",
			})
			return
		}

		tpAccountId, _ := utils.GetThirdPartyAccountId(c)
		if err := dc.Service.InsertRow(tpAccountId, projectTag, tableName, dto); err != nil {
			log.Println("err:", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{"message": "Row added successfully"})

	}
}
