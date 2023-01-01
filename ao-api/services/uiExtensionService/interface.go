package uiExtensionService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/uiExtensionStore"
)

func NewUIExtensionService(store uiExtensionStore.UIExtensionStore) UIExtensionService {
	return &uiExtensionService{Store: store}
}

type UIExtensionService interface {
	UpsertExtension(extension models.UIExtension) error
	DeleteExtension(accountId, projectTag, extensionName string) error
	ListExtensions(accountId, projectTag string) ([]models.UIExtension, error)
	GetExtension(accountId, projectTag, extensionName string) (models.UIExtension, error)
	GetExportableExtensionByProjectName(accountId, projectName, extensionName string) (models.ExportableUIExtension, error)
}

type uiExtensionService struct {
	Store uiExtensionStore.UIExtensionStore
}

var noContext = context.Background()
