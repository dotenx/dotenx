package integration

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

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
