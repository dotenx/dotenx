package marketplace

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/dotenx/dotenx/ao-api/services/uiComponentService"
	"github.com/dotenx/dotenx/ao-api/services/uiExtensionService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *MarketplaceController) AddItem(dbService databaseService.DatabaseService, cService crudService.CrudService, componentservice uiComponentService.UIcomponentService, pService projectService.ProjectService, extService uiExtensionService.UIExtensionService) gin.HandlerFunc {
	return func(c *gin.Context) {

		type itemDTO struct {
			Type             string                          `json:"type"`
			Category         string                          `json:"category"`
			Title            string                          `json:"title"`
			ShortDescription string                          `json:"shortDescription"`
			Description      string                          `json:"description"`
			Price            int                             `json:"price"`
			ImageUrl         string                          `json:"imageUrl"`
			TemplateUrl      string                          `json:"templateURL"`
			Features         []models.MarketplaceItemFeature `json:"features"`
			ProjectName      string                          `json:"projectName"`
			ComponentName    string                          `json:"component_name"`
			ExtensionName    string                          `json:"extension_name"`
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

		project, err := pService.GetProject(accountId, dto.ProjectName)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
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
			PreviewUrl:       dto.TemplateUrl,
			Features:         dto.Features,
			ProjectName:      dto.ProjectName,
			ProjectType:      project.Type,
			ProjectTag:       project.Tag,
			ProjectHasDb:     project.HasDatabase,
			ComponentName:    dto.ComponentName,
			ExtensionName:    dto.ExtensionName,
			Theme:            project.Theme,
		}

		if err := controller.Service.AddItem(item, dbService, cService, componentservice, extService); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.Status(http.StatusOK)
	}
}
