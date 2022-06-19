package project

import (
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (pc *ProjectController) AddProject() gin.HandlerFunc {
	return func(c *gin.Context) {
		var dto models.Project
		accountId, _ := utils.GetAccountId(c)
		fmt.Println(accountId)
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		if err := pc.Service.AddProject(accountId, dto); err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.JSON(200, gin.H{"message": "Project created successfully"})
	}
}
