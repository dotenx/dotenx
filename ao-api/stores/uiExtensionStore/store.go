package uiExtensionStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func New(db *db.DB) UIExtensionStore {
	return &uiExtensionStore{db}
}

type UIExtensionStore interface {
	UpsertExtension(ctx context.Context, extension models.UIExtension) error
	DeleteExtension(ctx context.Context, accountId, projectTag, extensionName string) error
	ListExtensions(ctx context.Context, accountId, projectTag string) ([]models.UIExtension, error)
	GetExtension(ctx context.Context, accountId, projectTag, extensionName string) (models.UIExtension, error)
}

type uiExtensionStore struct {
	db *db.DB
}
