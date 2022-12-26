package uiExtension

import (
	"encoding/json"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIExtensionController) UpsertExtension() gin.HandlerFunc {
	return func(c *gin.Context) {

		type ExtensionDto struct {
			Name     string          `json:"name" required:"true"`
			Content  json.RawMessage `json:"content" required:"true"`
			Category string          `json:"category" required:"true"`
		}

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		var extensionDto ExtensionDto
		if err := c.ShouldBindJSON(&extensionDto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		projectTag := c.Param("project_tag")
		extension := models.UIExtension{
			Name:       extensionDto.Name,
			Content:    extensionDto.Content,
			AccountId:  accountId,
			Status:     "modified",
			ProjectTag: projectTag,
			Category:   extensionDto.Category,
		}

		if err := controller.Service.UpsertExtension(extension); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	}
}
