package oauthController

import (
	"crypto/sha256"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
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

	providers := oauth.GetProvidersMap()
	if utils.ContainsString(utils.SpecialProviders, providerStr) {
		switch providerStr {
		case "airtable":
			state := utils.RandStringRunes(64, utils.FullRunes)
			codeVerifier := utils.Base64URLBytesEncode([]byte(utils.RandStringRunes(96, utils.FullRunes)))
			controller.Service.SetRedisPair(state, codeVerifier, 30*time.Minute)
			hasher := sha256.New()
			hasher.Write([]byte(codeVerifier))
			codeChallenge := utils.Base64URLBytesEncode(hasher.Sum(nil))
			scopes := url.QueryEscape(strings.TrimSuffix(strings.Join(providers[providerStr].Scopes, " "), " "))
			url := fmt.Sprintf("%s?client_id=%s&redirect_uri=%s&response_type=code&scope=%s&state=%s&code_challenge=%s&code_challenge_method=S256", providers[providerStr].DirectUrl, providers[providerStr].Key, config.Configs.Endpoints.AoApiLocal+"/oauth/integration/callbacks/airtable", scopes, state, codeChallenge)
			c.Redirect(http.StatusTemporaryRedirect, url)
			return
		default:
			c.Redirect(http.StatusTemporaryRedirect, providers[providerStr].DirectUrl)
			return
		}
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
