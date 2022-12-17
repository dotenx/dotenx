package uicomponent

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
	DeleteComponent handler handles deleting a component.
*/

func (controller *UIComponentController) DeleteComponent() gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		projectTag := c.Param("project_tag")
		pageName := c.Param("component_name")
		if err := controller.Service.DeleteComponent(accountId, projectTag, pageName); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	}
}
