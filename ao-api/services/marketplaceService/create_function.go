package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) CreateFunction(function models.Function) error {
	return ps.Store.CreateFunction(context.Background(), function)
}
