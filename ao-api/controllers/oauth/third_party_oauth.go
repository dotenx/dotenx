package oauthController

import (
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/oauth/provider"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/goth"
	"github.com/dotenx/goth/gothic"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// ThirdPartyOAuth initializes the OAuth flow by redirecting the user to the user providers login/consent page
func (controller *OauthController) ThirdPartyOAuth(c *gin.Context) {

	providerName := c.Param("provider_name")
	accountId := c.Param("account_id")
	userProvider, err := controller.Service.GetUserProviderByName(accountId, providerName)
	if utils.CheckErrorExist(c, err, http.StatusBadRequest) {
		return
	}
	redirectUrl := config.Configs.Endpoints.AoApiLocal + fmt.Sprintf("/oauth/user/provider/integration/callbacks/provider/%s/account_id/%s", providerName, accountId)

	tpAccountId, err := utils.GetThirdPartyAccountId(c)
	if err != nil {
		err = errors.New("can't authorize you (we missed your token)")
		utils.CheckErrorExist(c, err, http.StatusUnauthorized)
		return
	}
	log.Println("tpAccountId:", tpAccountId)
	session := sessions.Default(c)
	session.Set("tpAccountId", tpAccountId)
	err = session.Save()
	if utils.CheckErrorExist(c, err, http.StatusBadRequest) {
		return
	}

	if utils.ContainsString(utils.SpecialProviders, userProvider.Type) {
		c.Redirect(http.StatusTemporaryRedirect, userProvider.DirectUrl)
		return
	}

	gothProvider, err := provider.New(userProvider.Type, &userProvider.Secret, &userProvider.Key, redirectUrl, userProvider.Scopes...)
	if utils.CheckErrorExist(c, err, http.StatusBadRequest) {
		return
	}
	goth.UseProviders(*gothProvider)

	q := c.Request.URL.Query()
	q.Add("provider", userProvider.Type)
	c.Request.URL.RawQuery = q.Encode()
	gothic.BeginAuthHandler(c.Writer, c.Request)
}
