package marketplace

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *MarketplaceController) GetItem() gin.HandlerFunc {
	return func(c *gin.Context) {

		var idStr = c.Param("id")
		var id, err = strconv.Atoi(idStr)

		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		item, err := controller.Service.GetItem(id)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, item)
	}
}
