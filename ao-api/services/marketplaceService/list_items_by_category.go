package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) ListItemsByCategory(category string) ([]models.MarketplaceItem, error) {
	return ps.Store.ListItemsByCategory(context.Background(), category)
}
