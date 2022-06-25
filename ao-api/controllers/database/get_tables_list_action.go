package database

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (dc *DatabaseController) GetTablesList() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectName := c.Param("project_name")

		tables, err := dc.Service.GetTablesList(accountId, projectName)
		if err != nil && err.Error() != "not found" {
			log.Println("error:", err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(200, gin.H{"tables": tables})

	}
}
