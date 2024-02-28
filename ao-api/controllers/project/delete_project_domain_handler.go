package project

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (pc *ProjectController) DeleteProjectDomain(ubService uibuilderService.UIbuilderService) gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectTag := c.Param("project_tag")

		err := pc.Service.DeleteProjectDomain(accountId, projectTag, ubService)
		if err != nil {
			logrus.Error(err.Error())
			if err.Error() == "project_domain not found" {
				c.JSON(http.StatusNotFound, gin.H{"message": "entity not found"})
				return
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
		c.JSON(200, gin.H{"message": "the project domain was successfully deleted"})
	}
}
