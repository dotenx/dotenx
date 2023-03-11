package integration

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *IntegrationController) UpdateIntegration() gin.HandlerFunc {
	return func(c *gin.Context) {

		integrationName := c.Param("name")
		accountId, _ := utils.GetAccountId(c)
		var integration models.Integration
		if err := c.ShouldBindJSON(&integration); err != nil || accountId == "" || !integration.IsValid() {
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		integration.Name = integrationName

		tokenType, _ := c.Get("tokenType")
		if tokenType == "tp" {
			// for tp users we should have a provider so we fill this field with 'NULL' string
			integration.Provider = "NULL"
			tpAccountId, _ := utils.GetThirdPartyAccountId(c)
			integration.TpAccountId = tpAccountId
		} else {
			// This endpoint is called in studio mode so we should set provider empty
			// to know that this integration use our provider not user's provider
			integration.Provider = ""
		}

		// accessToken := integration.Secrets["ACCESS_TOKEN"]
		accessTokenSecret, hasSecret := integration.Secrets["ACCESS_TOKEN_SECRET"]
		refreshToken, ok := integration.Secrets["REFRESH_TOKEN"]
		if hasSecret && accessTokenSecret != "" {
			if integration.Provider == "" {
				provider, err := oauth.GetProviderModelByName(integration.Type)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{
						"message": "provider not found",
					})
					return
				}
				integration.Secrets["CONSUMER_KEY"] = provider.Key
				integration.Secrets["CONSUMER_SECRET"] = provider.Secret
			}
			// TODO: we should check that this part of code can cause a security issue or not (Hojjat-1)
			// Please don't delete comments
			/*else {
				userProvider, err := controller.OauthService.GetUserProviderByName(accountId, integration.Provider)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{
						"message": err.Error(),
					})
					return
				}
				integration.Secrets["CONSUMER_KEY"] = userProvider.Key
				integration.Secrets["CONSUMER_SECRET"] = userProvider.Secret
			}*/
		}
		if ok && refreshToken != "" {
			integration.HasRefreshToken = true
			redisRefreshTokenKey := "ao-api|" + accountId + "|" + integration.Name + "|refresh_token"
			redisErr := controller.Service.SetRedisPair(redisRefreshTokenKey, refreshToken, 0)
			if redisErr != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"err": redisErr.Error(),
				})
				return
			}
		}

		err := controller.Service.UpdateIntegration(accountId, integrationName, integration)
		if err != nil {
			logrus.Error(err.Error())
			if err == utils.ErrIntegrationNotFound {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, nil)
	}
}
