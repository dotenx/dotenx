package middlewares

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
	ProjectOwnerMiddleware checks that account id of project is equal to account id of user
	this middleware needs project tag and get it from c.Param("project_tag") or c.Param("tag")
*/

func ProjectOwnerMiddleware(projectService projectService.ProjectService) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectTag := ""
		projectTag = c.Param("project_tag")
		if projectTag == "" {
			projectTag = c.Param("tag")
		}
		if projectTag == "" {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		project, err := projectService.GetProjectByTag(projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		tokenType, _ := c.Get("tokenType")
		if tokenType == "external" || tokenType == "tp" {
			accountId, _ := utils.GetAccountId(c)
			if accountId != project.AccountId {
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
		} else {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}

		c.Next()
	}
}
