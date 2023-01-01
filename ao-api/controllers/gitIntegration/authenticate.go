package gitIntegration

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/goth"
	"github.com/dotenx/goth/gothic"
	"github.com/gin-gonic/gin"
)

/*
	Authenticate handler initializes the OAuth flow by redirecting the user to the providers login page
*/

func (controller *GitIntegrationController) Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		q := c.Request.URL.Query()
		providerStr := c.Param("provider")
		q.Add("provider", providerStr)

		if !utils.ContainsString(utils.GitIntegrationProviders, providerStr) {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "provider should be one of these values: ['github', 'gitlab', 'bitbucket']",
			})
			return
		}

		gothProvider, err := oauth.GetGitProviderByName(providerStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		goth.UseProviders(*gothProvider)
		c.Request.URL.RawQuery = q.Encode()
		gothic.BeginAuthHandler(c.Writer, c.Request)
	}
}
