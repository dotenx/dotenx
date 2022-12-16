package marketplaceStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

// This function returns all the items for a given account, no matter they are enabled or not. The reason is that a user wants to list their marketplace items.
func (store *marketplaceStore) ListItemsByAccount(ctx context.Context, accountId int) ([]models.MarketplaceItem, error) {
	listItems := `
	SELECT * FROM marketplace_items WHERE creator_account_id = $1
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = listItems
	default:
		return []models.MarketplaceItem{}, fmt.Errorf("driver not supported")
	}
	var items []models.MarketplaceItem
	rows, err := store.db.Connection.Queryx(stmt, accountId)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("item not found")
		}
		return []models.MarketplaceItem{}, err
	}
	for rows.Next() {
		var item models.MarketplaceItem
		err := rows.StructScan(&item)
		if err != nil {
			return []models.MarketplaceItem{}, err
		}

		var f []models.MarketplaceItemFeature
		err = json.Unmarshal(item.FeaturesForDb, &f)
		if err != nil {
			return []models.MarketplaceItem{}, err
		}
		item.Features = f

		if item.UpdatedAtForDb.Valid {
			item.UpdatedAt = item.UpdatedAtForDb.Time
		}

		items = append(items, item)
	}
	return items, nil
}
