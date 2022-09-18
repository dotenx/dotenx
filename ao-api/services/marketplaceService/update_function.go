package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) UpdateFunction(function models.Function) error {
	return ps.Store.UpdateFunction(context.Background(), function)
}
