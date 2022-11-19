package uibuilder

import (
	"encoding/json"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIbuilderController) UpsertPage() gin.HandlerFunc {
	return func(c *gin.Context) {

		type PageDTO struct {
			Name    string          `json:"name" required:"true"`
			Content json.RawMessage `json:"content" required:"true"`
		}

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		var pageDTO PageDTO
		if err := c.ShouldBindJSON(&pageDTO); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		projectTag := c.Param("project_tag")
		page := models.UIPage{
			Name:       pageDTO.Name,
			Content:    pageDTO.Content,
			AccountId:  accountId,
			Status:     "modified",
			ProjectTag: projectTag,
		}
		err := controller.Service.UpsertPage(page)
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
