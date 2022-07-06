package oauthController

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/oauth/provider"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/goth"
	"github.com/dotenx/goth/gothic"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// OAuthThirdPartyIntegrationCallback handles the oauth callback and return name of integration
// that is created in this function
func (controller *OauthController) OAuthThirdPartyIntegrationCallback(c *gin.Context) {

	providerName := c.Param("provider_name")
	accountId := c.Param("account_id")
	userProvider, err := controller.Service.GetUserProviderByName(accountId, providerName)
	if utils.CheckErrorExist(c, err, http.StatusBadRequest) {
		return
	}
	UI := userProvider.FrontEndUrl
	redirectUrl := config.Configs.Endpoints.AoApiLocal + fmt.Sprintf("/oauth/user/provider/integration/callbacks/provider/%s/account_id/%s", providerName, accountId)
	gothProvider, err := provider.New(userProvider.Type, &userProvider.Secret, &userProvider.Key, redirectUrl, userProvider.Scopes...)
	if utils.ShouldRedirectWithError(c, err, UI) {
		return
	}
	goth.UseProviders(*gothProvider)

	session := sessions.Default(c)
	tpAccountId, ok := session.Get("tpAccountId").(string)
	if tpAccountId == "" || !ok {
		err = errors.New("your_session_is_not_valid_please_try_again_later")
		utils.ShouldRedirectWithError(c, err, UI)
		return
	}

	fields, err := controller.IntegrationService.GetIntegrationFields(userProvider.Type)
	if utils.ShouldRedirectWithError(c, err, UI) {
		return
	}
	fields.Secrets = make([]models.IntegrationSecret, 0)
	integration := models.Integration{
		Name:        userProvider.Type + "-" + utils.RandStringRunes(8, utils.FullRunes),
		AccountId:   accountId,
		Type:        userProvider.Type,
		Provider:    userProvider.Name,
		TpAccountId: tpAccountId,
	}
	integration.Secrets = make(map[string]string)

	q := c.Request.URL.Query()
	q.Add("provider", userProvider.Type)
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
		integration.HasRefreshToken = true
		integration.Secrets["ACCESS_TOKEN"] = user.AccessToken
		integration.Secrets["REFRESH_TOKEN"] = user.RefreshToken
		redisAccessTokenKey := "ao-api|" + accountId + "|" + integration.Name + "|access_token"
		redisRefreshTokenKey := "ao-api|" + accountId + "|" + integration.Name + "|refresh_token"
		redisErr := controller.Service.SetRedisPair(redisAccessTokenKey, user.AccessToken, 60*time.Minute)
		if utils.ShouldRedirectWithError(c, redisErr, UI) {
			return
		}
		redisErr = controller.Service.SetRedisPair(redisRefreshTokenKey, user.RefreshToken, 0)
		if utils.ShouldRedirectWithError(c, redisErr, UI) {
			return
		}
		err := controller.IntegrationService.AddIntegration(accountId, integration)
		if utils.ShouldRedirectWithError(c, err, UI) {
			return
		}
		c.Redirect(http.StatusTemporaryRedirect, UI+"?integration_name="+integration.Name+"&access_token="+user.AccessToken+"&refresh_token="+user.RefreshToken)
		return
	} else if user.AccessTokenSecret != "" {
		integration.Secrets["CONSUMER_KEY"] = userProvider.Key
		integration.Secrets["CONSUMER_SECRET"] = userProvider.Secret
		integration.Secrets["ACCESS_TOKEN"] = user.AccessToken
		integration.Secrets["ACCESS_TOKEN_SECRET"] = user.AccessTokenSecret
		err := controller.IntegrationService.AddIntegration(accountId, integration)
		if utils.ShouldRedirectWithError(c, err, UI) {
			return
		}
		c.Redirect(http.StatusTemporaryRedirect, UI+"?integration_name="+integration.Name+"&access_token="+user.AccessToken+"&access_token_secret="+user.AccessTokenSecret)
		return
	} else {
		integration.Secrets["ACCESS_TOKEN"] = user.AccessToken
		err := controller.IntegrationService.AddIntegration(accountId, integration)
		if utils.ShouldRedirectWithError(c, err, UI) {
			return
		}
		c.Redirect(http.StatusTemporaryRedirect, UI+"?integration_name="+integration.Name+"&access_token="+user.AccessToken)
		return
	}
}
