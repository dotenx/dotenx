package marketplace

import (
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *MarketplaceController) UpdateItem() gin.HandlerFunc {
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
		}

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		var dto itemDTO
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		item := models.MarketplaceItem{
			Id:               id,
			AccountId:        accountId,
			Type:             dto.Type,
			Category:         dto.Category,
			Title:            dto.Title,
			ShortDescription: dto.ShortDescription,
			Description:      dto.Description,
			Price:            dto.Price,
			ImageUrl:         dto.ImageUrl,
			Features:         dto.Features,
		}

		if err := controller.Service.UpdateItem(item); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	}
}
