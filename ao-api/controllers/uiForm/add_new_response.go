package uiForm

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIFormController) AddNewResponse(pService projectService.ProjectService, ubService uibuilderService.UIbuilderService) gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")
		pageName := c.Param("page_name")
		formId := c.Param("form_id")

		type FormDto struct {
			Response json.RawMessage `json:"response" required:"true"`
			FormName string          `json:"form_name" required:"true"`
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
		if pageName == "" || formId == "" {
			err := errors.New("page name and form id can't be empty")
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

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

		form := models.UIForm{
			Name:        formDto.FormName,
			ProjectTag:  projectTag,
			PageName:    pageName,
			FormId:      formId,
			Response:    formDto.Response,
			SubmittedAt: time.Now().UTC().Format(time.RFC3339),
		}

		err := controller.Service.AddNewResponse(form, project.AccountId, project.Type)
		if err != nil {
			logrus.Error(err.Error())
			if err == utils.ErrReachLimitationOfPlan {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.Status(http.StatusOK)
	}
}
