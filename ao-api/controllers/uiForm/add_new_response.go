package uiForm

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIFormController) AddNewResponse(pService projectService.ProjectService) gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")

		type FormDto struct {
			PageName string          `json:"page_name" required:"true"`
			FormId   string          `json:"form_id" required:"true"`
			Response json.RawMessage `json:"response" required:"true"`
		}

		var formDto FormDto
		if err := c.ShouldBindJSON(&formDto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		if formDto.Response == nil || len(formDto.Response) == 0 {
			err := errors.New("response can't be empty")
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		_, pErr := pService.GetProjectByTag(projectTag)
		if pErr != nil {
			logrus.Error(pErr)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": pErr.Error(),
			})
			return
		}

		form := models.UIForm{
			ProjectTag: projectTag,
			PageName:   formDto.PageName,
			FormId:     formDto.FormId,
			Response:   formDto.Response,
		}

		if err := controller.Service.AddNewResponse(form); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	}
}
