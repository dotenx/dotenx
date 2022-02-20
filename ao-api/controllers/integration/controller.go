package execution

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
		c.JSON(http.StatusOK, nil)
	}
}
func (controller *IntegrationController) AddIntegration() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, nil)
	}
}
func (controller *IntegrationController) GetIntegrations() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, nil)
	}
}
