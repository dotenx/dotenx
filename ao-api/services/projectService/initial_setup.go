package projectService

import (
	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/sirupsen/logrus"
)

func (ps *projectService) InitialSetup(project models.Project) (err error) {
	switch project.Type {
	case "ecommerce":
		err = EcommerceInitialSetup(project, ps.DbStore)
	}
	if err != nil {
		logrus.Error(err)
		return err
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

	initialTablesList := []string{"integrations", "products", "orders", "reviews", "user_products"}
	isPublicList := []bool{false, true, false, false, false}
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
