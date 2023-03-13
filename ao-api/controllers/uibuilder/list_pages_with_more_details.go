package uibuilder

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/services/uiFormService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIbuilderController) ListPagesWithMoreDetails(uiFormService uiFormService.UIFormService) gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		projectTag := c.Param("project_tag")
		pages, err := controller.Service.ListPages(accountId, projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		resp := make([]map[string]interface{}, 0)
		for _, pageName := range pages {
			submittedForms, err := uiFormService.GetNumberOfFormSubmission(projectTag, pageName)
			if err != nil {
				logrus.Error(err.Error())
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			resp = append(resp, map[string]interface{}{
				"page_name":       pageName,
				"submitted_forms": submittedForms,
			})
		}

		c.JSON(http.StatusOK, resp)
	}
}
