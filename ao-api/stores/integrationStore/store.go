package integrationStore

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

type IntegrationStore interface {
	AddIntegration(ctx context.Context, accountId string, integration models.Integration) error
	GetIntegrationsByType(ctx context.Context, accountId, integrationType string) ([]models.Integration, error)
	GetAllintegrations(ctx context.Context, accountId string) ([]models.Integration, error)
}

type integrationStore struct {
	db *db.DB
}

func New(db *db.DB) IntegrationStore {
	return &integrationStore{db: db}
}

func (store *integrationStore) AddIntegration(ctx context.Context, accountId string, integration models.Integration) error {
	return nil
}
func (store *integrationStore) GetIntegrationsByType(ctx context.Context, accountId, integrationType string) ([]models.Integration, error) {
	return nil, nil
}
func (store *integrationStore) GetAllintegrations(ctx context.Context, accountId string) ([]models.Integration, error) {
	return nil, nil
}
