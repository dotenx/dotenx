package oauthController

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/goth"
	"github.com/dotenx/goth/gothic"
	"github.com/gin-gonic/gin"
)

// OAuthIntegrationCallback handles the oauth callback and return user access token.
func (controller *OauthController) OAuthIntegrationCallback(c *gin.Context) {
	UI := config.Configs.Endpoints.UILocal + "/integrations/add"
	q := c.Request.URL.Query()
	providerStr := c.Param("provider")

	specialProviders := []string{"slack", "instagram"}
	if utils.ContainsString(specialProviders, providerStr) {
		code := c.Query("code")
		providers := oauth.GetProvidersMap()
		var accessToken string
		var err error
		switch providerStr {
		case "slack":
			accessToken, err = getSlackAccessToken(providers["slack"].Key, providers["slack"].Secret, code, config.Configs.Endpoints.AoApiLocal+"/oauth/integration/callbacks/slack")
		case "instagram":
			accessToken, err = getInstagramAccessToken(providers["instagram"].Key, providers["instagram"].Secret, code, config.Configs.Endpoints.AoApiLocal+"/oauth/integration/callbacks/instagram")
		}
		if utils.ShouldRedirectWithError(c, err, UI) {
			return
		}
		c.Redirect(http.StatusTemporaryRedirect, UI+"?access_token="+accessToken)
		return
	}

	gothProvider, err := oauth.GetProviderByName(providerStr)
	if utils.ShouldRedirectWithError(c, err, UI) {
		return
	}
	goth.UseProviders(*gothProvider)
	q.Add("provider", providerStr)
	c.Request.URL.RawQuery = q.Encode()
	user, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if utils.ShouldRedirectWithError(c, err, UI) {
		return
	}
	log.Println("user:", user)
	log.Println("user.AccessToken:", user.AccessToken)
	log.Println("user.AccessTokenSecret:", user.AccessTokenSecret)
	log.Println("user.RefreshToken:", user.RefreshToken)
	if user.RefreshToken != "" {
		c.Redirect(http.StatusTemporaryRedirect, UI+"?access_token="+user.AccessToken+"&refresh_token="+user.RefreshToken)
	} else if user.AccessTokenSecret != "" {
		c.Redirect(http.StatusTemporaryRedirect, UI+"?access_token="+user.AccessToken+"&access_token_secret="+user.AccessTokenSecret)
	} else {
		c.Redirect(http.StatusTemporaryRedirect, UI+"?access_token="+user.AccessToken)
	}
}
