package oauthController

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (controller *OauthController) AddUserProvider() gin.HandlerFunc {
	return func(c *gin.Context) {
		var userProvider models.UserProvider
		accountId, _ := utils.GetAccountId(c)
		if err := c.ShouldBindJSON(&userProvider); err != nil || accountId == "" || userProvider.Name == "" || userProvider.Key == "" || userProvider.Secret == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid body for this endpoint",
			})
			return
		}

		userProvider.AccountId = accountId
		err := controller.Service.AddUserProvider(userProvider)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.Status(http.StatusOK)
		return
	}
}

func (controller *OauthController) GetUserProvider() gin.HandlerFunc {
	return func(c *gin.Context) {
		userProviderName := c.Param("name")
		accountId, _ := utils.GetAccountId(c)
		if accountId == "" || userProviderName == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid body for this endpoint",
			})
			return
		}

		userProvider, err := controller.Service.GetUserProviderByName(accountId, userProviderName)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"provider": userProvider,
		})
		return
	}
}

func (controller *OauthController) DeleteUserProvider() gin.HandlerFunc {
	return func(c *gin.Context) {
		userProviderName := c.Param("name")
		accountId, _ := utils.GetAccountId(c)
		if accountId == "" || userProviderName == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid body for this endpoint",
			})
			return
		}

		err := controller.Service.DeleteUserProvider(accountId, userProviderName)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.Status(http.StatusOK)
		return
	}
}

func (controller *OauthController) UpdateUserProvider() gin.HandlerFunc {
	return func(c *gin.Context) {
		var userProvider models.UserProvider
		accountId, _ := utils.GetAccountId(c)
		if err := c.ShouldBindJSON(&userProvider); err != nil || accountId == "" || userProvider.Name == "" || userProvider.Key == "" || userProvider.Secret == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid body for this endpoint",
			})
			return
		}

		userProvider.AccountId = accountId
		err := controller.Service.UpdateUserProvider(userProvider)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.Status(http.StatusOK)
		return
	}
}

func (controller *OauthController) GetAllUserProviders() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		providers, err := controller.Service.GetAllUserProviders(accountId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, providers)
		return
	}
}
