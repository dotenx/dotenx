package integration

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (controller *IntegrationController) GetIntegrationTypes() gin.HandlerFunc {
	return func(c *gin.Context) {
		integrations, _ := controller.Service.GetIntegrationTypes()
		//fmt.Println(integrations)
		c.JSON(http.StatusOK, integrations)
	}
}
