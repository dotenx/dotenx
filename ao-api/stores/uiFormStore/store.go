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
	GetFormsList(ctx context.Context, projectTag, pageName string) ([]models.UIForm, error)
	GetFormResponseListById(ctx context.Context, projectTag, pageName, formId string) ([]models.UIForm, error)
	GetNumberOfFormSubmission(ctx context.Context, projectTag, pageName string) (int64, error)
	GetNumberOfResponsesForUser(ctx context.Context, accountId, projectType, from, to string) (int64, error)
}

type uiFormStore struct {
	db *db.DB
}
