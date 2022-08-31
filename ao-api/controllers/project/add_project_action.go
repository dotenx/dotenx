package project

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (pc *ProjectController) AddProject() gin.HandlerFunc {
	return func(c *gin.Context) {
		var dto models.Project
		accountId, _ := utils.GetAccountId(c)

		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "name of project should contain just small letters, numbers and underscores",
			})
			return
		}

		// this is a temporary assignment until front-end supports hasDatabase field
		dto.HasDatabase = true

		if err := pc.Service.AddProject(accountId, dto); err != nil {
			log.Println(err)
			if err == utils.ErrReachLimitationOfPlan {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(200, gin.H{"message": "Project created successfully"})
	}
}
