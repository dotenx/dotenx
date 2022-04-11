package oauthController

import (
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/oauth/dotenx_goth/gothic"
	"github.com/dotenx/dotenx/ao-api/services/oauthService"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type OauthController struct {
	Service oauthService.OauthService
}

// OAuth initializes the OAuth flow by redirecting the user to the providers login page
func (controller *OauthController) OAuth(c *gin.Context) {
	q := c.Request.URL.Query()
	q.Add("provider", c.Param("provider"))
	c.Request.URL.RawQuery = q.Encode()
	gothic.BeginAuthHandler(c.Writer, c.Request)
}

// OAuthCallback handles the oauth callback which finishes the auth procedure.
func (controller *OauthController) OAuthCallback(c *gin.Context) {
	q := c.Request.URL.Query()
	provider := c.Param("provider")
	q.Add("provider", provider)
	c.Request.URL.RawQuery = q.Encode()
	user, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	// TODO: check if user is not loggind before, add user to list of users with it's name, email and ...
	session := sessions.Default(c)
	session.Set("accountId", user.UserID)
	fmt.Println("////////////////////////")
	fmt.Println("UserID:", user.UserID)
	fmt.Println("////////////////////////")
	err = session.Save()
	if err != nil {
		fmt.Fprintln(c.Writer, err)
		return
	}
	c.Redirect(307, config.Configs.Endpoints.AoApi)
}

// OAuthIntegrationCallback handles the oauth callback and return user access token.
func (controller *OauthController) OAuthIntegrationCallback(c *gin.Context) {
	// UI := config.Configs.Endpoints.UI + "/integrations/add"
	UI := config.Configs.Endpoints.UILocal + "/integrations/add"
	q := c.Request.URL.Query()
	providerStr := c.Param("provider")
	q.Add("provider", providerStr)
	c.Request.URL.RawQuery = q.Encode()
	user, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		c.Redirect(307, UI+"?error="+err.Error())
		return
	}
	fmt.Printf("user: %#v\n", user)
	fmt.Printf("RefreshToken: %#v\n", user.RefreshToken)
	if user.RefreshToken != "" {
		c.Redirect(307, UI+"?access_token="+user.AccessToken+"&refresh_token="+user.RefreshToken)
	} else {
		c.Redirect(307, UI+"?access_token="+user.AccessToken)
	}
}
