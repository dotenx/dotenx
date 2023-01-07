package gitIntegration

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *GitIntegrationController) ExportProject(mService marketplaceService.MarketplaceService, pService projectService.ProjectService, dbService databaseService.DatabaseService, cService crudService.CrudService) gin.HandlerFunc {
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
			ProjectName   string `json:"project_name"`
			GitAccountId  string `json:"git_account_id"`
			RepoFullName  string `json:"repo_full_name"`
			BranchName    string `json:"branch_name"`
			CommitMessage string `json:"commit_message"`
		}
		var dto branchDTO
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		err := controller.Service.ExportProject(accountId, dto.GitAccountId, providerStr, dto.RepoFullName, dto.BranchName, dto.CommitMessage, dto.ProjectName, mService, pService, dbService, cService)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "project successfully exported",
		})
	}
}
