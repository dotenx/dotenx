package uibuilder

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIbuilderController) GetPage() gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		projectTag := c.Param("project_tag")
		pageName := c.Param("page_name")
		page, err := controller.Service.GetPage(accountId, projectTag, pageName)
		if err != nil {
			logrus.Error(err.Error())
			if err == utils.ErrPageNotFound {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, page)
	}
}
