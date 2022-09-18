package marketplace

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *MarketplaceController) GetFunction() gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}
		functionName := c.Param("function_name")
		function, err := controller.Service.GetFunction(functionName)
		if err != nil && err.Error() == "function not found" {
			c.JSON(http.StatusOK, gin.H{
				"access": true,
				"exist":  false,
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
				"message": "you haven't access to get information about this function",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"access":   true,
			"exist":    true,
			"function": function,
		})
	}

}
