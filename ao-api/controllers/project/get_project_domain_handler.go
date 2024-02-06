package project

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (pc *ProjectController) GetProjectDomain() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectTag := c.Param("project_tag")

		projectDomain, err := pc.Service.GetProjectDomain(accountId, projectTag)
		// for some security reasons we can't give some sensitive data to users so
		// we should make some fields empty
		projectDomain.CdnArn = ""
		projectDomain.CdnDomain = ""
		projectDomain.TlsArn = ""
		if err != nil {
			if err.Error() == "project_domain not found" {
				c.JSON(http.StatusNotFound, gin.H{"message": "entity not found"})
				return
			} else {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
		c.JSON(http.StatusOK, projectDomain)
	}
}
