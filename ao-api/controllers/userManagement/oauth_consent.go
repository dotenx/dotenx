package userManagement

import (
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (umc *UserManagementController) OAuthConsent() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		projectTag := ctx.Param("project")
		providerName := ctx.Param("provider")

		project, err := umc.ProjectService.GetProjectByTag(projectTag)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		provider, err := umc.OauthService.GetUserProviderByName(project.AccountId, providerName)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		var url string
		if provider.Type == "twitter" {
			if !utils.ContainsString(provider.Scopes, "tweet.read") || !utils.ContainsString(provider.Scopes, "users.read") {
				ctx.JSON(http.StatusBadRequest, gin.H{
					"message": "twitter provider should has this scopes: ['tweet.read' 'users.read']",
				})
				return
			}
			redirectUrl := config.Configs.Endpoints.AoApiLocal + fmt.Sprintf("/user/management/project/%s/provider/%s/callback", projectTag, providerName)
			scopes := ""
			for i, scope := range provider.Scopes {
				if i < len(provider.Scopes)-1 {
					scopes += scope + "%20"
				} else {
					scopes += scope
				}
			}
			// Todo: state and code_challenge should be a random string
			// and we need save that on redis or session to check later
			state := "0a1b2c3d4e5f6g7h"
			url = fmt.Sprintf("https://twitter.com/i/oauth2/authorize?response_type=code&client_id=%s&redirect_uri=%s&scope=%s&code_challenge=%s&code_challenge_method=plain&state=%s",
				provider.Key, redirectUrl, scopes, config.Configs.Secrets.CodeChallenge, state)
		}

		ctx.Redirect(http.StatusTemporaryRedirect, url)
		return
	}
}
