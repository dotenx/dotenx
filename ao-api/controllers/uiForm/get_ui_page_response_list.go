package uiForm

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIFormController) GetUiPageResponseList() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")
		pageName := c.Param("page_name")

		forms, err := controller.Service.GetUiPageResponseList(projectTag, pageName)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		if forms == nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "there is no response for requested form",
			})
			return
		}
		c.JSON(http.StatusOK, forms)
	}
}
