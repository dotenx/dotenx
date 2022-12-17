package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) ListItemsByType(itemType string) ([]models.MarketplaceItem, error) {
	return ps.Store.ListItemsByType(context.Background(), itemType)
}
