package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) AddItem(item models.MarketplaceItem) error {
	return ps.Store.AddItem(context.Background(), item)
}
