package oauthController

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/goth"
	"github.com/dotenx/goth/gothic"
	"github.com/gin-gonic/gin"
)

// OAuth initializes the OAuth flow by redirecting the user to the providers login page
func (controller *OauthController) OAuth(c *gin.Context) {
	q := c.Request.URL.Query()
	providerStr := c.Param("provider")
	q.Add("provider", providerStr)

	specialProviders := []string{"slack", "instagram"}
	if utils.ContainsString(specialProviders, providerStr) {
		providers := oauth.GetProvidersMap()
		c.Redirect(http.StatusTemporaryRedirect, providers[providerStr].DirectUrl)
		return
	}

	gothProvider, err := oauth.GetProviderByName(providerStr)
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
