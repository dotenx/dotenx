package marketplaceService

import (
	"github.com/aws/aws-sdk-go/service/sts"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/uiComponentService"
	"github.com/dotenx/dotenx/ao-api/services/uiExtensionService"
	"github.com/dotenx/dotenx/ao-api/stores/marketplaceStore"
	"github.com/dotenx/dotenx/ao-api/stores/uibuilderStore"
)

type MarketplaceService interface {
	AddItem(item models.MarketplaceItem, dbService databaseService.DatabaseService, cService crudService.CrudService, componentService uiComponentService.UIcomponentService, extensionService uiExtensionService.UIExtensionService) error
	UpdateItem(item models.MarketplaceItem) error
	DisableItem(item models.MarketplaceItem) error
	EnableItem(item models.MarketplaceItem) error
	GetItem(id int) (models.MarketplaceItem, error)
	ListItemsByCategory(category string) ([]models.MarketplaceItem, error)
	ListItemsByAccount(accountId int) ([]models.MarketplaceItem, error)
	ListItemsByType(itemType string) ([]models.MarketplaceItem, error)
	ListItems(accountId, category, itemType string, enable bool) ([]models.MarketplaceItem, error)
	ExportProject(accountId string, projectName, projectTag string, projectHasDb bool, dbService databaseService.DatabaseService, cService crudService.CrudService) (projectDto models.ProjectDto, err error)
	GetProjectOfItem(id int) (projectDto models.ProjectDto, err error)
	GetComponentOfItem(id int) (componentDto models.ExportableUIComponent, err error)
	GetExtensionOfItem(id int) (models.ExportableUIExtension, error)
	GetTemporaryCredential(useCase, accountId string) (credentials sts.Credentials, err error)
	CreateFunction(function models.Function) error
	UpdateFunction(function models.Function) error
	GetFunction(name string) (models.Function, error)
}

func NewMarketplaceService(store marketplaceStore.MarketplaceStore, uiBuilderStore uibuilderStore.UIbuilderStore) MarketplaceService {
	return &marketplaceService{
		Store:          store,
		UIBuilderStore: uiBuilderStore,
	}
}

type marketplaceService struct {
	Store          marketplaceStore.MarketplaceStore
	UIBuilderStore uibuilderStore.UIbuilderStore
}
