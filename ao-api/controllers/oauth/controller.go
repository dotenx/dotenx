package oauthController

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/markbates/goth/gothic"
	"github.com/utopiops/automated-ops/ao-api/config"
	"github.com/utopiops/automated-ops/ao-api/services/oauthService"
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
	err = session.Save()
	if err != nil {
		fmt.Fprintln(c.Writer, err)
		return
	}
	c.Redirect(307, config.Configs.Endpoints.AoApi)
}
