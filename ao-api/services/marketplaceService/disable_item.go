package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) DisableItem(item models.MarketplaceItem) error {
	return ps.Store.DisableItem(context.Background(), item)
}

func (ps *marketplaceService) EnableItem(item models.MarketplaceItem) error {
	return ps.Store.EnableItem(context.Background(), item)
}
