package marketplaceStore

import (
	"context"
	"fmt"
	"time"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *marketplaceStore) EnableItem(ctx context.Context, item models.MarketplaceItem) error {
	disableItem := `
	UPDATE marketplace_items SET enabled = true, updated_at = $1
	WHERE id = $2 AND creator_account_id = $3
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = disableItem
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt, time.Now(), item.Id, item.AccountId)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return fmt.Errorf("item not found")
		}
		logrus.Error(err.Error())
		return err
	}
	return nil
}
