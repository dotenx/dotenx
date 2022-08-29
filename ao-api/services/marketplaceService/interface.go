package marketplaceService

import (
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/marketplaceStore"
)

type MarketplaceService interface {
	AddItem(item models.MarketplaceItem) error
	UpdateItem(item models.MarketplaceItem) error
	DisableItem(item models.MarketplaceItem) error
	GetItem(id int) (models.MarketplaceItem, error)
	ListItemsByCategory(category string) ([]models.MarketplaceItem, error)
	ListItemsByAccount(accountId int) ([]models.MarketplaceItem, error)
	ListItemsByType(itemType string) ([]models.MarketplaceItem, error)
	ListItems(accountId, category, itemType string) ([]models.MarketplaceItem, error)
}

func NewMarketplaceService(store marketplaceStore.MarketplaceStore) MarketplaceService {
	return &marketplaceService{Store: store}
}

type marketplaceService struct {
	Store marketplaceStore.MarketplaceStore
}
