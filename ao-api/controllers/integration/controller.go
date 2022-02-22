package integration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/services/integrationService"
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

func (controller *IntegrationController) GetAllIntegrationsForAccountByType() gin.HandlerFunc {
	return func(c *gin.Context) {
		typeIntegration := c.Param("type")
		accountId := c.MustGet("accountId").(string)
		integrations, err := controller.Service.GetAllIntegrationsForAccountByType(accountId, typeIntegration)
		if err == nil {
			c.JSON(http.StatusOK, integrations)
			return
		}
		c.JSON(http.StatusBadRequest, err.Error())

	}
}

func (controller *IntegrationController) GetAllIntegrations() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId := c.MustGet("accountId").(string)
		integrations, err := controller.Service.GetAllIntegrations(accountId)
		if err == nil {
			c.JSON(http.StatusOK, integrations)
			return
		}
		c.JSON(http.StatusBadRequest, err.Error())

	}
}

func (controller *IntegrationController) AddIntegration() gin.HandlerFunc {
	return func(c *gin.Context) {
		var integration models.Integration
		accountId := c.MustGet("accountId").(string)
		if err := c.ShouldBindJSON(&integration); err != nil || accountId == "" || !integration.IsValid() {
			c.AbortWithStatus(http.StatusBadRequest)
			return
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
		c.JSON(http.StatusOK, integrations)
	}
}
