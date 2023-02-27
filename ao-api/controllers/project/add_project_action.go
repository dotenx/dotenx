package project

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (pc *ProjectController) AddProject(mService marketplaceService.MarketplaceService, dbService databaseService.DatabaseService, cService crudService.CrudService, uiBuilderService uibuilderService.UIbuilderService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var dto ProjectRequest
		accountId, _ := utils.GetAccountId(c)
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "name of project should contain just small letters, numbers and underscores also project type should be one of 'web_application', 'landing_page', 'ecommerce', 'website'",
			})
			return
		}
		if dto.Type == "" {
			dto.Type = "web_application"
		}
		switch dto.Type {
		case "web_application":
			dto.HasDatabase = true
		case "landing_page":
			dto.HasDatabase = false
		case "ecommerce":
			dto.HasDatabase = true
		case "website":
			dto.HasDatabase = false
		}

		var err error
		if dto.ItemId != 0 {
			err = pc.Service.ImportProject(accountId, dto.Name, dto.Description, dto.ItemId, mService, dbService, cService, uiBuilderService)
		} else {
			err = pc.Service.AddProject(accountId, models.Project{
				Id:               dto.Id,
				Name:             dto.Name,
				Description:      dto.Description,
				AccountId:        accountId,
				DefaultUserGroup: dto.DefaultUserGroup, // todo: do we need to keep this? seems too early in the user flow.
				Type:             dto.Type,
				Theme:            dto.Theme,
				HasDatabase:      dto.HasDatabase,
			}, uiBuilderService)
		}
		if err != nil {
			log.Println(err)
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

		project, pErr := pc.Service.GetProject(accountId, dto.Name)
		if pErr != nil {
			logrus.Error(pErr)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": pErr.Error(),
			})
			return
		}
		project.AccountId = accountId

		err = pc.Service.InitialSetup(project)
		if err != nil {
			logrus.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{"message": "Project created successfully"})
	}
}

type ProjectRequest struct {
	ItemId           int    `json:"itemId"`
	Id               int    `db:"id" json:"-"`
	Name             string `db:"name" json:"name" binding:"regexp=^[a-z][a-z0-9_]*$,min=2,max=20"`
	Description      string `db:"description" json:"description"`
	AccountId        string `db:"account_id" json:"-"`
	Tag              string `db:"tag" json:"tag"`
	DefaultUserGroup string `json:"default_user_group"`
	Type             string `db:"type" json:"type" binding:"oneof='' 'web_application' 'landing_page' 'ecommerce' 'website'"`
	Theme            string `db:"theme" json:"theme"`
	HasDatabase      bool   `json:"hasDatabase"`
}
