package marketplaceService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *marketplaceService) GetFunction(name string) (models.Function, error) {
	return ps.Store.GetFunction(context.Background(), name)
}
