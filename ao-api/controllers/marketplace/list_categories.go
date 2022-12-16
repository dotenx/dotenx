package marketplace

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *MarketplaceController) ListCategories() gin.HandlerFunc {
	return func(c *gin.Context) {

		var listCategoriesDTO struct {
			ItemType string `json:"itemType"`
		}
		if err := c.ShouldBindJSON(&listCategoriesDTO); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		result := categories[listCategoriesDTO.ItemType]
		c.JSON(http.StatusOK, result)

	}
}

var categories = map[string][]string{
	"project_template": {
		"Client Portals",
		"Internal Tools",
		"Marketplaces",
		"Online Communities",
		"Resource Directories",
		"Websites",
		"Dashboards",
		"Misc",
	},
	"component": {
		"Charts",
		"Misc",
	},
	"page_template": {
		"Login",
		"Register",
		"Dashboard",
		"Misc",
	},
}
