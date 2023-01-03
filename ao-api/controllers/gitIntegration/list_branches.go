package gitIntegration

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *GitIntegrationController) ListBranches() gin.HandlerFunc {
	return func(c *gin.Context) {
		providerStr := c.Param("provider")
		accountId, _ := utils.GetAccountId(c)

		if !utils.ContainsString(utils.GitIntegrationProviders, providerStr) {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "provider should be one of these values: ['github', 'gitlab', 'bitbucket']",
			})
			return
		}

		type branchDTO struct {
			GitAccountId string `json:"git_account_id"`
			RepoFullName string `json:"repo_full_name"`
		}
		var dto branchDTO
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		branches, err := controller.Service.ListBranches(accountId, dto.GitAccountId, providerStr, dto.RepoFullName)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"branches": branches,
			"total":    len(branches),
		})
	}
}
