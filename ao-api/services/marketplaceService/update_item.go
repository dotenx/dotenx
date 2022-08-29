package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) UpdateItem(item models.MarketplaceItem) error {
	return ps.Store.UpdateItem(context.Background(), item)
}
