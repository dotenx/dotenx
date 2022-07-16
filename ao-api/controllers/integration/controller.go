package integration

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/services/oauthService"
	"github.com/gin-gonic/gin"
)

type IntegrationController struct {
	Service      integrationService.IntegrationService
	OauthService oauthService.OauthService
}

func (controller *IntegrationController) GetIntegrationTypeFields() gin.HandlerFunc {
	return func(c *gin.Context) {
		typeIntegration := c.Param("type")
		fields, err := controller.Service.GetIntegrationFields(typeIntegration)
		if err == nil {
			c.JSON(http.StatusOK, fields)
			return
		}
		c.JSON(http.StatusBadRequest, err.Error())

	}
}

func (controller *IntegrationController) DeleteIntegration() gin.HandlerFunc {
	return func(c *gin.Context) {
		integrationName := c.Param("name")
		accountId, _ := utils.GetAccountId(c)
		err := controller.Service.DeleteIntegration(accountId, integrationName)
		if err == nil {
			c.JSON(http.StatusOK, nil)
			return
		}
		c.JSON(http.StatusBadRequest, err.Error())

	}
}

func (controller *IntegrationController) GetAllIntegrations() gin.HandlerFunc {
	return func(c *gin.Context) {
		types := c.QueryArray("type")
		forTemplate := c.Query("for_template")
		fmt.Println(types)
		accountId, _ := utils.GetAccountId(c)
		var integrations []models.Integration
		var err error
		if len(types) == 0 {
			integrations, err = controller.Service.GetAllIntegrations(accountId)
		} else {
			integrations, err = controller.Service.GetAllIntegrationsForAccountByType(accountId, types)
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, err.Error())
			return
		}
		if forTemplate != "true" {
			c.JSON(http.StatusOK, integrations)
			return
		}
		selected := make([]models.Integration, 0)
		for _, integ := range integrations {
			if integ.Provider != "" {
				selected = append(selected, integ)
			}
		}
		c.JSON(http.StatusOK, selected)
	}
}

func (controller *IntegrationController) AddIntegration() gin.HandlerFunc {
	return func(c *gin.Context) {
		var integration models.Integration
		accountId, _ := utils.GetAccountId(c)
		if err := c.ShouldBindJSON(&integration); err != nil || accountId == "" || !integration.IsValid() {
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		// This endpoint is called in studio mode so we should set provider empty
		// to know that this integration use our provider not user's provider
		integration.Provider = ""

		accessToken := integration.Secrets["ACCESS_TOKEN"]
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
			redisAccessTokenKey := "ao-api|" + accountId + "|" + integration.Name + "|access_token"
			redisRefreshTokenKey := "ao-api|" + accountId + "|" + integration.Name + "|refresh_token"
			redisErr := controller.Service.SetRedisPair(redisAccessTokenKey, accessToken, 60*time.Minute)
			if redisErr != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"err": redisErr.Error(),
				})
				return
			}
			redisErr = controller.Service.SetRedisPair(redisRefreshTokenKey, refreshToken, 0)
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
func (controller *IntegrationController) GetIntegrationTypes() gin.HandlerFunc {
	return func(c *gin.Context) {
		integrations, _ := controller.Service.GetIntegrationTypes()
		//fmt.Println(integrations)
		c.JSON(http.StatusOK, integrations)
	}
}
