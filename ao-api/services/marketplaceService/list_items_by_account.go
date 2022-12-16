package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) ListItemsByAccount(accountId int) ([]models.MarketplaceItem, error) {
	return ps.Store.ListItemsByAccount(context.Background(), accountId)
}
