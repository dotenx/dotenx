package oauthController

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/oauthService"
	"github.com/dotenx/goth/gothic"
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
	if c.Param("provider") == "slack" {
		providers := oauth.GetProvidersMap()
		c.Redirect(307, providers["slack"].DirectUrl)
		return
	}
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
		log.Println(err.Error())
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
	if providerStr == "slack" {
		code := c.Param("code")
		providers := oauth.GetProvidersMap()
		accessToekn, err := getSlackAccessToken(providers["slack"].Key, providers["slack"].Secret, code, "https://ao-api.dotenx.com/oauth/integration/callbacks/slack")
		if err != nil {
			c.Redirect(307, UI+"?error="+err.Error())
			return
		}
		c.Redirect(307, UI+"?access_token="+accessToekn)
		return
	}
	q.Add("provider", providerStr)
	c.Request.URL.RawQuery = q.Encode()
	user, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		c.Redirect(307, UI+"?error="+err.Error())
		return
	}
	fmt.Printf("user: %#v\n", user)
	fmt.Printf("RefreshToken: %#v\n", user.RefreshToken)
	fmt.Println("user.AccessTokenSecret:", user.AccessTokenSecret)
	if user.RefreshToken != "" {
		c.Redirect(307, UI+"?access_token="+user.AccessToken+"&refresh_token="+user.RefreshToken)
	} else if user.AccessTokenSecret != "" {
		c.Redirect(307, UI+"?access_token="+user.AccessToken+"&access_token_secret="+user.AccessTokenSecret)
	} else {
		c.Redirect(307, UI+"?access_token="+user.AccessToken)
	}
}

func getSlackAccessToken(clientId, clientSecret, code, redirectUrl string) (string, error) {
	var dto struct {
		AccessToekn string `json:"access_token"`
	}
	data := map[string]string{
		"client_id":     clientId,
		"client_secret": clientSecret,
		"code":          code,
		"redirect_uri":  redirectUrl,
	}
	url := "https://slack.com/api/oauth.v2.access"
	headers := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
	}
	json_data, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	body := bytes.NewBuffer(json_data)
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodPost, url, body, headers, time.Minute, true)
	if err != nil {
		return "", err
	}
	if status != 200 {
		return "", errors.New("not ok with status ")
	}
	err = json.Unmarshal(out, &dto)
	return dto.AccessToekn, err
}
