package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) DisableItem(item models.MarketplaceItem) error {
	return ps.Store.DisableItem(context.Background(), item)
}
