package gitIntegration

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *GitIntegrationController) ListIntegrations() gin.HandlerFunc {
	return func(c *gin.Context) {
		providerStr := c.Param("provider")
		accountId, _ := utils.GetAccountId(c)

		if !utils.ContainsString(utils.GitIntegrationProviders, providerStr) {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "provider should be one of these values: ['github', 'gitlab', 'bitbucket']",
			})
			return
		}

		integrations, err := controller.Service.ListIntegrations(accountId, providerStr)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "an internal server error occurred",
			})
			return
		}
		if integrations == nil {
			integrations = make([]models.GitIntegration, 0)
		}
		c.JSON(http.StatusOK, integrations)
	}
}
