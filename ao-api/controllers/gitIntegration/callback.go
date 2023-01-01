package gitIntegration

import (
	"encoding/json"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/goth"
	"github.com/dotenx/goth/gothic"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *GitIntegrationController) Callback() gin.HandlerFunc {
	return func(c *gin.Context) {
		UI := config.Configs.Endpoints.UILocal + "/git/integration/callback"
		q := c.Request.URL.Query()
		providerStr := c.Param("provider")

		gothProvider, err := oauth.GetGitProviderByName(providerStr)
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

		userBytes, _ := json.Marshal(user)
		logrus.Info("user:", string(userBytes))
		logrus.Trace("user.AccessToken:", user.AccessToken)
		logrus.Trace("user.AccessTokenSecret:", user.AccessTokenSecret)
		logrus.Trace("user.RefreshToken:", user.RefreshToken)

		// accountId, err := utils.GetAccountId(c)
		// if utils.ShouldRedirectWithError(c, err, UI) {
		// 	return
		// }
		// secrets := map[string]interface{}{
		// 	"access_token":  user.AccessToken,
		// 	"refresh_token": user.RefreshToken,
		// }
		// secretBytes, _ := json.Marshal(secrets)
		// hasRefreshToken := user.RefreshToken != ""
		// integration := models.GitIntegration{
		// 	AccountId:    accountId,
		// 	GitAccountId: user.UserID,
		// 	// GitUsername: "",
		// 	Provider:        providerStr,
		// 	Secrets:         secretBytes,
		// 	HasRefreshToken: hasRefreshToken,
		// }

		if user.RefreshToken != "" {
			c.Redirect(http.StatusTemporaryRedirect, UI+"?access_token="+user.AccessToken+"&refresh_token="+user.RefreshToken)
		} else if user.AccessTokenSecret != "" {
			c.Redirect(http.StatusTemporaryRedirect, UI+"?access_token="+user.AccessToken+"&access_token_secret="+user.AccessTokenSecret)
		} else {
			c.Redirect(http.StatusTemporaryRedirect, UI+"?access_token="+user.AccessToken)
		}
	}
}
