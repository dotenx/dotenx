package marketplace

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *MarketplaceController) ListItems() gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId, category, itemType, projectType string
		var enable bool
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
		if pt, ok := c.GetQuery("project_type"); ok {
			projectType = pt
		}
		if e, ok := c.GetQuery("enabled"); ok {
			enable = e == "true"
		} else {
			enable = true
		}
		if !enable {
			adminSecret := c.GetHeader("Market-Place-Admin-Secret")
			if adminSecret != config.Configs.Secrets.MarketPlaceAdminSecret {
				logrus.Error("invalid secret")
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
		}

		items, err := controller.Service.ListItems(accountId, category, itemType, projectType, enable)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, items)
	}
}
