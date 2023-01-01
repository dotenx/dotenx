package uiExtension

import (
	"encoding/json"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIExtensionController) UpsertExtension(mService marketplaceService.MarketplaceService) gin.HandlerFunc {
	return func(c *gin.Context) {

		type ExtensionDto struct {
			Name     string          `json:"name" required:"true"`
			ItemId   int             `json:"itemId"`
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

		if extensionDto.ItemId != 0 {
			ext, err := mService.GetExtensionOfItem(extensionDto.ItemId)
			if err != nil {
				logrus.Error(err.Error())
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			extension.Content = ext.Content
		}
		if err := controller.Service.UpsertExtension(extension); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	}
}
