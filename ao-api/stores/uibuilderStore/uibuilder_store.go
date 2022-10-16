package uibuilderStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func New(db *db.DB) UIbuilderStore {
	return &uibuilderStore{db}
}

type UIbuilderStore interface {
	UpsertPage(ctx context.Context, page models.UIPage) error
	DeletePage(ctx context.Context, accountId, projectTag, pageName string) error
	ListPages(ctx context.Context, accountId, projectTag string) ([]string, error)
	GetPage(ctx context.Context, accountId, projectTag, pageName string) (models.UIPage, error)
	SetPageStatus(ctx context.Context, accountId, projectTag, pageName, status string) error
	GetUiInfrastructure(ctx context.Context, accountId, projectTag string) (models.UiInfrastructure, error)
	UpsertUiInfrastructure(ctx context.Context, uiInfra models.UiInfrastructure) error
	GetExportablePageByProjectName(ctx context.Context, accountId, projectName string) ([]models.ExportableUIPage, error)
	// This function deletes all the pages of a project
	DeleteAllPages(ctx context.Context, accountId, projectTag string) error

	UpsertGlobalStates(ctx context.Context, globalState models.GlobalState) error
	GetGlobalStates(ctx context.Context, accountId, projectName string) (globalState models.GlobalState, err error)
}

type uibuilderStore struct {
	db *db.DB
}
