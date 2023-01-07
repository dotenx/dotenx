package gitIntegration

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *GitIntegrationController) ListRepositories() gin.HandlerFunc {
	return func(c *gin.Context) {
		providerStr := c.Param("provider")
		accountId, _ := utils.GetAccountId(c)

		if !utils.ContainsString(utils.GitIntegrationProviders, providerStr) {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "provider should be one of these values: ['github', 'gitlab', 'bitbucket']",
			})
			return
		}

		type integrationDTO struct {
			GitAccountId string `json:"git_account_id"`
		}
		var dto integrationDTO
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		repositories, err := controller.Service.ListRepositories(accountId, dto.GitAccountId, providerStr)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"repositories": repositories,
			"total":        len(repositories),
		})
	}
}
