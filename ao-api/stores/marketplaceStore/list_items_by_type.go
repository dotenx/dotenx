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

func (store *marketplaceStore) ListItemsByType(ctx context.Context, itemType string) ([]models.MarketplaceItem, error) {
	listItems := `
	SELECT * FROM marketplace_items WHERE item_type = $1 and enabled = true
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = listItems
	default:
		return []models.MarketplaceItem{}, fmt.Errorf("driver not supported")
	}
	var items []models.MarketplaceItem
	rows, err := store.db.Connection.Queryx(stmt, itemType)
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
