package uicomponent

import (
	"encoding/json"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
	ListComponents handler handles upserting a component.
	If itemId ==0 we use given content otherwise we use content from item.
*/

func (controller *UIComponentController) UpsertComponent(mService marketplaceService.MarketplaceService) gin.HandlerFunc {
	return func(c *gin.Context) {

		type ComponentDto struct {
			Name     string          `json:"name" required:"true"`
			ItemId   int             `json:"itemId"`
			Content  json.RawMessage `json:"content" required:"true"`
			Category string          `json:"category" required:"true"`
		}

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		var componentDto ComponentDto
		if err := c.ShouldBindJSON(&componentDto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		projectTag := c.Param("project_tag")
		page := models.UIComponent{
			Name:       componentDto.Name,
			Content:    componentDto.Content,
			AccountId:  accountId,
			Status:     "modified",
			ProjectTag: projectTag,
			Category:   componentDto.Category,
		}

		if componentDto.ItemId != 0 {
			component, err := mService.GetComponentOfItem(componentDto.ItemId)
			if err != nil {
				logrus.Error(err.Error())
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			page.Content = component.Content
		}
		if err := controller.Service.UpsertComponent(page); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	}
}
