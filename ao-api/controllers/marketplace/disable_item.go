package marketplace

import (
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *MarketplaceController) DisableItem() gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		item := models.MarketplaceItem{
			Id:        id,
			AccountId: accountId,
		}

		if err := controller.Service.DisableItem(item); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	}
}
