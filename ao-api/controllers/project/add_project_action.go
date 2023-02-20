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
				"message": "name of project should contain just small letters, numbers and underscores also project type should be one of 'freestyle', 'landing_page', 'ecommerce', 'ui_portfolio'",
			})
			return
		}
		if dto.Type == "" {
			dto.Type = "freestyle"
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

		switch project.Type {
		case "ecommerce":
			err = EcommerceInitialSetup(project, dbService)
		}
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
	Type             string `db:"type" json:"type" binding:"oneof='' 'freestyle' 'landing_page' 'ecommerce' 'ui_portfolio'"`
	Theme            string `db:"theme" json:"theme"`
	HasDatabase      bool   `json:"hasDatabase"`
}

func EcommerceInitialSetup(project models.Project, dbService databaseService.DatabaseService) (err error) {
	initialTablesList := []string{"integrations", "products", "orders", "reviews", "user_products"}
	isPublicList := []bool{false, true, false, false, false}
	for i, tableName := range initialTablesList {
		err = dbService.AddTable(project.AccountId, project.Name, tableName, isPublicList[i], false)
		if err != nil {
			return err
		}
	}
	initialTableColumnsList := map[string]interface{}{
		"integrations": []map[string]string{
			{
				"name": "type",
				"type": "short_text",
			},
			{
				"name": "integration_name",
				"type": "short_text",
			},
		},
		"products": []map[string]string{
			{
				"name": "type",
				"type": "short_text",
			},
			{
				"name": "name",
				"type": "short_text",
			},
			{
				"name": "summary",
				"type": "long_text",
			},
			{
				"name": "description",
				"type": "long_text",
			},
			{
				"name": "price",
				"type": "float_num",
			},
			{
				"name": "status",
				"type": "short_text",
			},
			{
				"name": "image_url",
				"type": "short_text",
			},
			{
				"name": "limitation",
				"type": "num",
			},
			{
				"name": "preview_link",
				"type": "long_text",
			},
			{
				"name": "download_link",
				"type": "long_text",
			},
			{
				"name": "metadata",
				"type": "dtx_json",
			},
			{
				"name": "stripe_price_id",
				"type": "short_text",
			},
			{
				"name": "stripe_product_id",
				"type": "short_text",
			},
			{
				"name": "content",
				"type": "long_text",
			},
			{
				"name": "html_content",
				"type": "long_text",
			},
			{
				"name": "tags",
				"type": "text_array",
			},
			{
				"name": "currency",
				"type": "short_text",
			},
			{
				"name": "recurring_payment",
				"type": "dtx_json",
			},
			{
				"name": "file_names",
				"type": "text_array",
			},
			{
				"name": "details",
				"type": "dtx_json",
			},
			{
				"name": "thumbnails",
				"type": "text_array",
			},
		},
		"orders": []map[string]string{
			{
				"name": "__products",
				"type": "link_field",
			},
			{
				"name": "quantity",
				"type": "num",
			},
			{
				"name": "address",
				"type": "dtx_json",
			},
			{
				"name": "email",
				"type": "email",
			},
			{
				"name": "payment_status",
				"type": "short_text",
			},
			{
				"name": "updated_at",
				"type": "date_time",
			},
			{
				"name": "paid_amount",
				"type": "float_num",
			},
		},
		"reviews": []map[string]string{
			{
				"name": "__products",
				"type": "link_field",
			},
			{
				"name": "message",
				"type": "long_text",
			},
			{
				"name": "rate",
				"type": "float_num",
			},
			{
				"name": "confirmed",
				"type": "yes_no",
			},
		},
		"user_products": []map[string]string{
			{
				"name": "__products",
				"type": "link_field",
			},
			{
				"name": "email",
				"type": "email",
			},
			{
				"name": "valid_until",
				"type": "date_time",
			},
		},
	}
	for tableName, columns := range initialTableColumnsList {
		for _, column := range columns.([]map[string]string) {
			err = dbService.AddTableColumn(project.AccountId, project.Name, tableName, column["name"], column["type"])
			if err != nil {
				return err
			}
		}
	}
	return
}
