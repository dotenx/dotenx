package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) GetItem(id int) (models.MarketplaceItem, error) {
	return ps.Store.GetItem(context.Background(), id)
}
