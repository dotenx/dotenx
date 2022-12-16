package marketplaceStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func New(db *db.DB) MarketplaceStore {
	return &marketplaceStore{db}
}

type MarketplaceStore interface {
	AddItem(ctx context.Context, item models.MarketplaceItem) error
	UpdateItem(ctx context.Context, item models.MarketplaceItem) error
	DisableItem(ctx context.Context, item models.MarketplaceItem) error
	EnableItem(ctx context.Context, item models.MarketplaceItem) error
	GetItem(ctx context.Context, id int) (models.MarketplaceItem, error)
	ListItemsByCategory(ctx context.Context, category string) ([]models.MarketplaceItem, error)
	ListItemsByAccount(ctx context.Context, accountId int) ([]models.MarketplaceItem, error)
	ListItemsByType(ctx context.Context, itemType string) ([]models.MarketplaceItem, error)
	ListItems(ctx context.Context, accountId, category, itemType string, enabled bool) ([]models.MarketplaceItem, error)
	CreateFunction(ctx context.Context, function models.Function) error
	GetFunction(ctx context.Context, name string) (models.Function, error)
	UpdateFunction(ctx context.Context, function models.Function) error
}

type marketplaceStore struct {
	db *db.DB
}
