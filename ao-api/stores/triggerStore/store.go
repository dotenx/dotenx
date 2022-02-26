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
	AddTrigger(ctx context.Context, accountId string, trigger models.EventTrigger) error
	GetTriggersByType(ctx context.Context, accountId, triggerType string) ([]models.EventTrigger, error)
	GetAllTriggers(ctx context.Context, accountId string) ([]models.EventTrigger, error)
}

type integrationStore struct {
	db *db.DB
}

func New(db *db.DB) IntegrationStore {
	return &integrationStore{db: db}
}

var storeTrigger = `
INSERT INTO integrations (account_id, type, name, url, key, secret, access_token)
VALUES ($1, $2, $3, $4, $5, $6, $7)
`

func (store *integrationStore) AddTrigger(ctx context.Context, accountId string, trigger models.EventTrigger) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = storeTrigger
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

var getTriggersByType = `
select * from integrations 
where account_id = $1 and type = $2;
`

func (store *integrationStore) GetTriggersByType(ctx context.Context, accountId, triggerType string) ([]models.EventTrigger, error) {
	res := make([]models.Integration, 0)
	switch store.db.Driver {
	case db.Postgres:
		conn := store.db.Connection
		rows, err := conn.Queryx(getTriggersByType, accountId, integrationType)
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

var getTriggers = `
select * from integrations 
where account_id = $1;
`

func (store *integrationStore) GetAllTriggers(ctx context.Context, accountId string) ([]models.EventTrigger, error) {
	res := make([]models.Integration, 0)
	switch store.db.Driver {
	case db.Postgres:
		conn := store.db.Connection
		rows, err := conn.Queryx(getTriggers, accountId)
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
