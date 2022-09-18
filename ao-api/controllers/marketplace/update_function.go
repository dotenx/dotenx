package marketplace

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *MarketplaceController) UpdateFunction() gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		var functionDto models.Function
		if err := c.ShouldBindJSON(&functionDto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		functionDto.Enabled = false
		functionDto.AccountId = accountId

		function, err := controller.Service.GetFunction(functionDto.Name)
		if err != nil && err.Error() == "function not found" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		} else if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "an internal server error occurred",
			})
			return
		}

		if function.AccountId != accountId {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "you haven't access to update this function",
			})
			return
		}

		if err := controller.Service.UpdateFunction(functionDto); err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "an internal server error occurred",
			})
			return
		}
		c.Status(http.StatusOK)
	}
}
