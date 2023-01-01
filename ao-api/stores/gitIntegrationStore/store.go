package gitIntegrationStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func New(db *db.DB) GitIntegrationStore {
	return &gitIntegrationStore{db}
}

type GitIntegrationStore interface {
	UpsertIntegration(ctx context.Context, integration models.GitIntegration) error
	GetIntegration(ctx context.Context, accountId, gitAccountId, provider string) (models.GitIntegration, error)
}

type gitIntegrationStore struct {
	db *db.DB
}
