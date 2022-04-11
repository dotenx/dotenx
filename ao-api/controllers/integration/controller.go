package integration

import (
	"fmt"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/gin-gonic/gin"
)

type IntegrationController struct {
	Service integrationService.IntegrationService
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
		fmt.Println(types)
		accountId, _ := utils.GetAccountId(c)
		if len(types) == 0 {
			integrations, err := controller.Service.GetAllIntegrations(accountId)
			if err == nil {
				c.JSON(http.StatusOK, integrations)
				return
			}
			c.JSON(http.StatusBadRequest, err.Error())
		} else {
			integrations, err := controller.Service.GetAllIntegrationsForAccountByType(accountId, types)
			if err == nil {
				c.JSON(http.StatusOK, integrations)
				return
			}
			c.JSON(http.StatusBadRequest, err.Error())
		}
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

		accessToken := integration.Secrets["ACCESS_TOKEN"]
		refreshToken, ok := integration.Secrets["REFRESH_TOKEN"]
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
