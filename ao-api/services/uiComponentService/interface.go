package uiComponentService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/uiComponentStore"
)

func NewUIbuilderService(store uiComponentStore.UIComponentStore) UIcomponentService {
	return &uiComponentService{Store: store}
}

type UIcomponentService interface {
	UpsertComponent(page models.UIComponent) error
	DeleteComponent(accountId, projectTag, pageName string) error
	ListComponents(accountId, projectTag string) ([]models.UIComponent, error)
	GetComponent(accountId, projectTag, pageName string) (models.UIComponent, error)
	SetComponentStatus(accountId, projectTag, pageName, status string) error
	GetUiInfrastructure(accountId, projectTag string) (models.UiInfrastructure, error)
	UpsertUiInfrastructure(uiInfra models.UiInfrastructure) error
	// This function deletes all the components of a project
	DeleteAllComponents(accountId, projectTag string) error
	GetExportableComponentByProjectName(accountId, projectTag, componentName string) (models.ExportableUIComponent, error)
}

type uiComponentService struct {
	Store uiComponentStore.UIComponentStore
}

var noContext = context.Background()
