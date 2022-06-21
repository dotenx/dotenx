package project

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (pc *ProjectController) ListProjects() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)

		projects, err := pc.Service.ListProjects(accountId)
		if err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.JSON(200, projects)
	}
}
