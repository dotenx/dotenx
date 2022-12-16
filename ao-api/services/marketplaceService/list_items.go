package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) ListItems(accountId, category, itemType string, enable bool) ([]models.MarketplaceItem, error) {
	return ps.Store.ListItems(context.Background(), accountId, category, itemType, enable)
}
