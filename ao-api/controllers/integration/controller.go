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
		//integrationType := c.Param("type")
		//accountId := c.MustGet("accountId").(string)
		c.JSON(http.StatusOK, nil)
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
		type field struct {
			Key  string `json:"key"`
			Type string `json:"type"`
		}
		type integration struct {
			Type   string  `json:"type"`
			Fields []field `json:"fields"`
		}
		res := make([]integration, 0)
		for typeInteg, integ := range models.AvaliableIntegrations {
			integr := integration{Type: typeInteg, Fields: make([]field, 0)}
			if integ.NeedsAccessToken {
				integr.Fields = append(integr.Fields, field{Type: "text", Key: "access_token"})
			}
			if integ.NeedsKey {
				integr.Fields = append(integr.Fields, field{Type: "text", Key: "key"})
			}
			if integ.NeedsSecret {
				integr.Fields = append(integr.Fields, field{Type: "text", Key: "secret"})
			}
			if integ.NeedsUrl {
				integr.Fields = append(integr.Fields, field{Type: "text", Key: "url"})
			}
			res = append(res, integr)
		}
		c.JSON(http.StatusOK, res)
	}
}
