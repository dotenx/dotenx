package project

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type InitialSetupRequest struct {
	ProjectName string `json:"project_name"`
}

func (pc *ProjectController) ProjectInitialSetup(dbService databaseService.DatabaseService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var dto InitialSetupRequest
		accountId, _ := utils.GetAccountId(c)
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "name of project should contain just small letters, numbers and underscores also project type should be one of 'freestyle', 'landing_page', 'ecommerce', 'ui_portfolio'",
			})
			return
		}

		project, pErr := pc.Service.GetProject(accountId, dto.ProjectName)
		if pErr != nil {
			logrus.Error(pErr)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": pErr.Error(),
			})
			return
		}
		project.AccountId = accountId

		var err error
		switch project.Type {
		case "ecommerce":
			err = EcommerceInitialSetup(project, dbService)
		}
		if err != nil {
			logrus.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Project setup completed successfully"})
	}
}

func EcommerceInitialSetup(project models.Project, dbService databaseService.DatabaseService) (err error) {
	initialTablesList := []string{"integrations", "products", "orders", "reviews"}
	for _, tableName := range initialTablesList {
		err = dbService.AddTable(project.AccountId, project.Name, tableName, false, false)
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
				"name": "file_urls",
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
