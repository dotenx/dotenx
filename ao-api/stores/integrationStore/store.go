package integrationStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"

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
	res, err := store.db.Connection.Exec(stmt, accountId, integration.Type, integration.Name,
		integration.Url, integration.Key, integration.Secret, integration.AccessToken)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not add integration, try again")
	}
	return nil
}

var getIntegrationsByType = `
select * from integrations 
where account_id = $1 and type = $2;
`

func (store *integrationStore) GetIntegrationsByType(ctx context.Context, accountId, integrationType string) ([]models.Integration, error) {
	res := make([]models.Integration, 0)
	switch store.db.Driver {
	case db.Postgres:
		conn := store.db.Connection
		rows, err := conn.Queryx(getIntegrationsByType, accountId, integrationType)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return nil, err
		}
		for rows.Next() {
			var cur models.Integration
			rows.StructScan(&cur)
			if err != nil {
				return nil, err
			}
			res = append(res, cur)
		}
	}
	return res, nil
}

var getIntegrations = `
select * from integrations 
where account_id = $1;
`

func (store *integrationStore) GetAllintegrations(ctx context.Context, accountId string) ([]models.Integration, error) {
	res := make([]models.Integration, 0)
	switch store.db.Driver {
	case db.Postgres:
		conn := store.db.Connection
		rows, err := conn.Queryx(getIntegrations, accountId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return nil, err
		}
		for rows.Next() {
			var cur models.Integration
			rows.StructScan(&cur)
			if err != nil {
				return nil, err
			}
			res = append(res, cur)
		}
	}
	return res, nil
}
