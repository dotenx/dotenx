package integration

import (
	"errors"
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v72/client"
)

func (controller *IntegrationController) AddIntegration() gin.HandlerFunc {
	return func(c *gin.Context) {
		var integration models.Integration
		accountId, _ := utils.GetAccountId(c)
		if err := c.ShouldBindJSON(&integration); err != nil || accountId == "" || !integration.IsValid() {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "validation failed",
			})
			return
		}
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

		// we check validity of integration secrets in this switch case
		switch integration.Type {
		case "stripe":
			secretKey := integration.Secrets["SECRET_KEY"]
			sc := &client.API{}
			sc.Init(secretKey, nil)
			_, err := sc.Account.Get()
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "invalid stripe secret key",
				})
				return
			}
		case "sendGrid":
			apiKey := integration.Secrets["ACCESS_TOKEN"]
			host := "https://api.sendgrid.com"
			request := sendgrid.GetRequest(apiKey, "/v3/scopes", host)
			request.Method = "GET"
			response, err := sendgrid.API(request)
			// TODO: check scopes and insure that this api key has access to send email
			if err != nil || response.StatusCode != http.StatusOK {
				if err == nil {
					err = errors.New("invalid sendGrid api key")
				}
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "invalid sendGrid api key",
				})
				return
			}
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

		err := controller.Service.AddIntegration(accountId, integration)
		if err != nil {
			log.Println(err.Error())
			c.JSON(http.StatusInternalServerError, err.Error())
			return
		}
		c.JSON(http.StatusOK, nil)
	}
}
