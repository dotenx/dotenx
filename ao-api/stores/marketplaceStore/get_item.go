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

func (store *marketplaceStore) GetItem(ctx context.Context, id int) (models.MarketplaceItem, error) {
	upsertItem := `
	SELECT * FROM marketplace_items WHERE id = $1
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertItem
	default:
		return models.MarketplaceItem{}, fmt.Errorf("driver not supported")
	}
	var item models.MarketplaceItem

	err := store.db.Connection.QueryRowx(stmt, id).StructScan(&item)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("item not found")
		}
	}

	var f []models.MarketplaceItemFeature
	err = json.Unmarshal(item.FeaturesForDb, &f)
	if err != nil {
		return models.MarketplaceItem{}, err
	}
	item.Features = f

	if item.UpdatedAtForDb.Valid {
		item.UpdatedAt = item.UpdatedAtForDb.Time
	}

	return item, err
}
