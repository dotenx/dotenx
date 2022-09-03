package project

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/gin-gonic/gin"
)

func (pc *ProjectController) DeleteProject(mService marketplaceService.MarketplaceService, dbService databaseService.DatabaseService, cService crudService.CrudService, uiBuilderService uibuilderService.UIbuilderService) gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)

		err := pc.Service.DeleteProject(accountId, c.Param("project_tag"), uiBuilderService, dbService, cService)
		if err != nil {
			log.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"message": "Project delete successfully"})
	}
}
