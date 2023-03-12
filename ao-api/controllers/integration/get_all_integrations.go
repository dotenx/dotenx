package integration

import (
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (controller *IntegrationController) GetAllIntegrations() gin.HandlerFunc {
	return func(c *gin.Context) {
		types := c.QueryArray("type")
		forTemplate := c.Query("for_template")
		projectName := c.Query("project_name")
		fmt.Println(types)
		accountId, _ := utils.GetAccountId(c)
		var integrations []models.Integration
		var err error
		if len(types) == 0 {
			integrations, err = controller.Service.GetAllIntegrations(accountId, projectName)
		} else {
			integrations, err = controller.Service.GetAllIntegrationsForAccountByType(accountId, projectName, types)
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
