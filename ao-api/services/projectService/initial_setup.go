package projectService

import (
	"encoding/json"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/objectstoreService"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
	"github.com/sirupsen/logrus"
)

func (ps *projectService) InitialSetup(project models.Project, objService objectstoreService.ObjectstoreService) (err error) {
	switch project.Type {
	case "ecommerce":
		err = EcommerceInitialSetup(project, ps.DbStore)
	case "ai_website":
		err = AiWebsiteInitialSetup(project, objService, ps.Store)
	}
	if err != nil {
		logrus.Error(err)
		return err
	}
	return
}

func AiWebsiteInitialSetup(project models.Project, objService objectstoreService.ObjectstoreService, projectStore projectStore.ProjectStore) (err error) {
	var aiWebsiteConfiguration models.AIWebsiteConfigurationType
	err = json.Unmarshal(project.AIWebsiteConfiguration, &aiWebsiteConfiguration)
	if err != nil {
		logrus.Error(err.Error())
		return
	}

	if aiWebsiteConfiguration.LogoKey != "" {

		// Check if the user has enough space
		hasAccess, err := objService.CheckUploadFileAccess(project.AccountId, project.Type)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		if !hasAccess {
			err = utils.ErrReachLimitationOfPlan
			logrus.Error(err.Error())
			return err
		}

		logoSize, err := utils.GetObjectSize(config.Configs.Upload.S3LogoBucket, aiWebsiteConfiguration.LogoKey)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}

		url := fmt.Sprintf("%s/%s", config.Configs.Upload.PublicUrl, aiWebsiteConfiguration.LogoKey)
		// Prepare the url of the file based on its access
		toAdd := models.Objectstore{
			Key:         aiWebsiteConfiguration.LogoKey,
			AccountId:   project.AccountId,
			TpAccountId: "",
			ProjectTag:  project.Tag,
			Size:        int(logoSize),
			// Access:      access,
			Url:         url,
			IsPublic:    true,
			UserGroups:  []string{},
			DisplayName: aiWebsiteConfiguration.LogoKey,
		}

		err = objService.AddObject(toAdd)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}

		// Move logo file from temporary bucket to main upload bucket
		err = utils.CopyFile(config.Configs.Upload.S3LogoBucket, config.Configs.Upload.S3Bucket, aiWebsiteConfiguration.LogoKey, aiWebsiteConfiguration.LogoKey)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		err = utils.DeleteObject(config.Configs.Upload.S3LogoBucket, aiWebsiteConfiguration.LogoKey)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}

		// Make logo file public on the main upload bucket
		err = utils.MakeObjectPublic(config.Configs.Upload.S3Bucket, aiWebsiteConfiguration.LogoKey)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}

		// Update AI website configuration
		aiWebsiteConfiguration.LogoUrl = url
		aiWebsiteConfigurationBytes, err := json.Marshal(aiWebsiteConfiguration)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		project.AIWebsiteConfiguration = aiWebsiteConfigurationBytes
		err = projectStore.UpdateProjectByTag(noContext, project.Tag, project)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
	}

	return
}

func EcommerceInitialSetup(project models.Project, dbStore databaseStore.DatabaseStore) (err error) {

	// get database instance of DoTenX user database
	db, fn, err := dbutil.GetDbInstance(project.AccountId, project.Name)
	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		logrus.Error("Error getting database connection:", err)
		return err
	}

	initialTablesList := []string{"integrations", "products", "orders", "reviews", "user_products", "discount_codes"}
	isPublicList := []bool{false, true, false, false, false, false}
	for i, tableName := range initialTablesList {
		err = dbStore.AddTable(noContext, db, project.AccountId, project.Name, tableName, isPublicList[i], false)
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
				"name": "json_content",
				"type": "dtx_json",
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
			{
				"name": "versions",
				"type": "dtx_json",
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
			{
				"name": "version",
				"type": "num",
			},
		},
		"reviews": []map[string]string{
			{
				"name": "__products",
				"type": "link_field",
			},
			{
				"name": "email",
				"type": "email",
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
			{
				"name": "version",
				"type": "num",
			},
		},
		"discount_codes": []map[string]string{
			{
				"name": "name",
				"type": "short_text",
			},
			{
				"name": "code",
				"type": "short_text",
			},
			{
				"name": "percentage",
				"type": "float_num",
			},
			{
				"name": "amount",
				"type": "float_num",
			},
			{
				"name": "currency",
				"type": "short_text",
			},
			{
				"name": "products",
				"type": "text_array",
			},
			{
				"name": "quantity",
				"type": "num",
			},
			{
				"name": "stripe_promotion_code_id",
				"type": "short_text",
			},
		},
	}
	for tableName, columns := range initialTableColumnsList {
		for _, column := range columns.([]map[string]string) {
			err = dbStore.AddTableColumn(noContext, db, project.AccountId, project.Name, tableName, column["name"], column["type"])
			if err != nil {
				return err
			}
		}
	}
	return
}
