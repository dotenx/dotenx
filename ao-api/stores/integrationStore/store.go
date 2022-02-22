package integrationStore

import (
	"context"
	"fmt"

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

var storeIntegration = `
INSERT INTO integrations (account_id, type, name, url, key, secret, access_token)
VALUES ($1, $2, $3, $4, $5, $6, $7)
`

func (store *integrationStore) AddIntegration(ctx context.Context, accountId string, integration models.Integration) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = storeIntegration
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, integration.AccountId, integration.Type, integration.Name,
		integration.Url, integration.Key, integration.Secret, integration.AccessToken)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not add integration, try again")
	}
	return nil
}

var storeIntegration = `
INSERT INTO integrations (account_id, type, name, url, key, secret, access_token)
VALUES ($1, $2, $3, $4, $5, $6, $7)
`

func (store *integrationStore) GetIntegrationsByType(ctx context.Context, accountId, integrationType string) ([]models.Integration, error) {
	return nil, nil
}

var storeIntegration = `
INSERT INTO integrations (account_id, type, name, url, key, secret, access_token)
VALUES ($1, $2, $3, $4, $5, $6, $7)
`

func (store *integrationStore) GetAllintegrations(ctx context.Context, accountId string) ([]models.Integration, error) {
	return nil, nil
}
