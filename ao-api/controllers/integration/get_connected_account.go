package integration

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *IntegrationController) GetConnectedAccount() gin.HandlerFunc {
	return func(c *gin.Context) {

		integrationName := c.Param("name")
		accountId, _ := utils.GetAccountId(c)

		details, err := controller.Service.GetConnectedAccount(accountId, integrationName)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, details)
	}
}
