package marketplace

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *MarketplaceController) AddItem(dbService databaseService.DatabaseService, cService crudService.CrudService) gin.HandlerFunc {
	return func(c *gin.Context) {

		type itemDTO struct {
			Type             string                          `json:"type"`
			Category         string                          `json:"category"`
			Title            string                          `json:"title"`
			ShortDescription string                          `json:"shortDescription"`
			Description      string                          `json:"description"`
			Price            int                             `json:"price"`
			ImageUrl         string                          `json:"imageUrl"`
			Features         []models.MarketplaceItemFeature `json:"features"`
			ProjectName      string                          `json:"projectName"`
		}

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		var dto itemDTO
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		item := models.MarketplaceItem{
			AccountId:        accountId,
			Type:             dto.Type,
			Category:         dto.Category,
			Title:            dto.Title,
			ShortDescription: dto.ShortDescription,
			Description:      dto.Description,
			Price:            dto.Price,
			ImageUrl:         dto.ImageUrl,
			Features:         dto.Features,
			ProjectName:      dto.ProjectName,
		}

		if err := controller.Service.AddItem(item, dbService, cService); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	}
}
