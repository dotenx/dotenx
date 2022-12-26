package uiExtension

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIExtensionController) GetExtension() gin.HandlerFunc {
	return func(c *gin.Context) {
		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		projectTag := c.Param("project_tag")
		extensionName := c.Param("extension_name")
		extension, err := controller.Service.GetExtension(accountId, projectTag, extensionName)
		if err != nil {
			logrus.Error(err.Error())
			if err.Error() == "extension not found" {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
				})
				return
			}
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, extension)
	}
}
