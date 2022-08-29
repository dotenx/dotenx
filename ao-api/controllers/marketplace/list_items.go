package marketplace

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *MarketplaceController) ListItems() gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId, category, itemType string
		// get accountId, category, itemType from query params
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}
		if c, ok := c.GetQuery("category"); ok {
			category = c
		}
		if t, ok := c.GetQuery("type"); ok {
			itemType = t
		}

		items, err := controller.Service.ListItems(accountId, category, itemType)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, items)
	}
}
