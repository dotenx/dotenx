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
		c.JSON(http.StatusNotImplemented, nil)
	}
}
func (controller *IntegrationController) GetIntegrations() gin.HandlerFunc {
	return func(c *gin.Context) {
		integrations := make([]string, 0)
		for _, integ := range models.AvaliableIntegrations {
			integrations = append(integrations, integ.Type)
		}
		c.JSON(http.StatusOK, integrations)
	}
}
