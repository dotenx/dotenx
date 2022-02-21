package integration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/services/integrationService"
)

type IntegrationController struct {
	Service integrationService.IntegrationService
}

func (controller *IntegrationController) GetIntegrationFields() gin.HandlerFunc {
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

func (controller *IntegrationController) AddIntegration() gin.HandlerFunc {
	return func(c *gin.Context) {
		//accountId := c.MustGet("accountId").(string)
		controller.Service.AddIntegration()
		c.JSON(http.StatusNotImplemented, nil)
	}
}
func (controller *IntegrationController) GetIntegrations() gin.HandlerFunc {
	return func(c *gin.Context) {
		integrations, _ := controller.Service.GetIntegrations()
		c.JSON(http.StatusOK, integrations)
	}
}
