package uiComponentStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func New(db *db.DB) UIComponentStore {
	return &uiComponentStore{db}
}

type UIComponentStore interface {
	UpsertComponent(ctx context.Context, page models.UIComponent) error
	DeleteComponent(ctx context.Context, accountId, projectTag, pageName string) error
	ListComponents(ctx context.Context, accountId, projectTag string) ([]models.UIComponent, error)
	GetComponent(ctx context.Context, accountId, projectTag, pageName string) (models.UIComponent, error)
	SetComponentStatus(ctx context.Context, accountId, projectTag, pageName, status string) error
	GetUiInfrastructure(ctx context.Context, accountId, projectTag string) (models.UiInfrastructure, error)
	UpsertUiInfrastructure(ctx context.Context, uiInfra models.UiInfrastructure) error
	GetExportableComponentByProjectName(ctx context.Context, accountId, projectName, componentName string) (models.ExportableUIComponent, error)
	// This function deletes all the components of a project
	DeleteAllComponents(ctx context.Context, accountId, projectTag string) error
}

type uiComponentStore struct {
	db *db.DB
}
