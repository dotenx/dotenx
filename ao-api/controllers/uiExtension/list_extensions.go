package uiExtension

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIExtensionController) ListExtensions() gin.HandlerFunc {
	return func(c *gin.Context) {
		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		projectTag := c.Param("project_tag")
		extensions, err := controller.Service.ListExtensions(accountId, projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, extensions)
	}
}
