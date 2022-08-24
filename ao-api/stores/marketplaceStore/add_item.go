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

func (store *marketplaceStore) AddItem(ctx context.Context, item models.MarketplaceItem) error {
	addItem := `
	INSERT INTO marketplace_items (item_type, category, title, short_description, description, creator_account_id, price, features, image_url, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = addItem
	default:
		return fmt.Errorf("driver not supported")
	}

	bytes, err := json.Marshal(item.Features)

	if err != nil {
		return err
	}

	_, err = store.db.Connection.Exec(stmt, item.Type, item.Category, item.Title, item.ShortDescription, item.Description, item.AccountId, item.Price, string(bytes), item.ImageUrl, time.Now())

	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return nil
}
