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
}

type uibuilderStore struct {
	db *db.DB
}
