package uiFormStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func New(db *db.DB) UIFormStore {
	return &uiFormStore{db}
}

type UIFormStore interface {
	AddNewResponse(ctx context.Context, form models.UIForm) error
	GetUiPageResponseList(ctx context.Context, projectTag, pageName string) ([]models.UIForm, error)
}

type uiFormStore struct {
	db *db.DB
}
