package uiForm

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIFormController) GetFormsList(pService projectService.ProjectService, ubService uibuilderService.UIbuilderService) gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")
		pageName := c.Param("page_name")

		project, pErr := pService.GetProjectByTag(projectTag)
		if pErr != nil {
			logrus.Error(pErr)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": pErr.Error(),
			})
			return
		}

		_, pErr = ubService.GetPage(project.AccountId, projectTag, pageName)
		if pErr != nil {
			logrus.Error(pErr)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": pErr.Error(),
			})
			return
		}

		forms, err := controller.Service.GetFormsList(projectTag, pageName)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		if forms == nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "there is no form for requested page",
			})
			return
		}
		c.JSON(http.StatusOK, forms)
	}
}
