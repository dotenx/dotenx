package marketplaceStore

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *marketplaceStore) UpdateItem(ctx context.Context, item models.MarketplaceItem) error {
	updateItem := `
	UPDATE marketplace_items SET item_type = $1, category = $2, title = $3, 
	short_description = $4, description = $5,
	price = $6, features = $7, image_url = $8, updated_at = $9
	WHERE id = $10 AND creator_account_id = $11
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = updateItem
	default:
		return fmt.Errorf("driver not supported")
	}

	bytes, err := json.Marshal(item.Features)

	if err != nil {
		return err
	}
	_, err = store.db.Connection.Exec(stmt, item.Type, item.Category, item.Title, item.ShortDescription, item.Description, item.Price, string(bytes), item.ImageUrl, time.Now(), item.Id, item.AccountId)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return fmt.Errorf("item not found")
		}
		logrus.Error(err.Error())
		return err
	}
	return nil
}
