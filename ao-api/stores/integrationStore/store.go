package integrationStore

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

type IntegrationStore interface {
	AddIntegration(ctx context.Context, accountId string, integration models.IntegrationDefinition) error
}

type integrationStore struct {
	db *db.DB
}

func New(db *db.DB) IntegrationStore {
	return &integrationStore{db: db}
}

func (store *integrationStore) AddIntegration(ctx context.Context, accountId string, integration models.IntegrationDefinition) error {
	return nil
}
