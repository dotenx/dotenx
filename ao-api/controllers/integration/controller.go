package integration

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
	//"github.com/utopiops/automated-ops/ao-api/services/integrationService"
)

type IntegrationController struct {
	//Service integrationService.IntegrationService
}

func (controller *IntegrationController) GetIntegrationFields() gin.HandlerFunc {
	return func(c *gin.Context) {
		typeIntegration := c.Param("type")
		type field struct {
			Key  string `json:"key"`
			Type string `json:"type"`
		}
		fields := make([]field, 0)
		for _, integ := range models.AvaliableIntegrations {
			if integ.Type == typeIntegration {
				if integ.NeedsAccessToken {
					fields = append(fields, field{Type: "text", Key: "access_token"})
				}
				if integ.NeedsKey {
					fields = append(fields, field{Type: "text", Key: "key"})
				}
				if integ.NeedsSecret {
					fields = append(fields, field{Type: "text", Key: "secret"})
				}
				if integ.NeedsUrl {
					fields = append(fields, field{Type: "text", Key: "url"})
				}
				c.JSON(http.StatusOK, fields)
				return
			}
		}
		c.AbortWithStatus(http.StatusBadRequest)

	}
}
func (controller *IntegrationController) AddIntegration() gin.HandlerFunc {
	return func(c *gin.Context) {
		//accountId := c.MustGet("accountId").(string)
		c.JSON(http.StatusOK, nil)
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
