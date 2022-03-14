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
	DeleteIntegration(ctx context.Context, accountId string, integrationName string) error
	CheckTasksForIntegration(ctx context.Context, accountId string, integrationName string) (bool, error)
	CheckTriggersForIntegration(ctx context.Context, accountId string, integrationName string) (bool, error)
	GetIntegrationsByType(ctx context.Context, accountId, integrationType string) ([]models.Integration, error)
	GetAllintegrations(ctx context.Context, accountId string) ([]models.Integration, error)
	GetIntegrationByName(ctx context.Context, accountId, name string) (models.Integration, error)
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

var getIntegrationsByName = `
select * from integrations 
where account_id = $1 and name = $2;
`

func (store *integrationStore) GetIntegrationByName(ctx context.Context, accountId, name string) (models.Integration, error) {
	switch store.db.Driver {
	case db.Postgres:
		conn := store.db.Connection
		rows, err := conn.Queryx(getIntegrationsByName, accountId, name)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return models.Integration{}, err
		}
		for rows.Next() {
			var cur models.Integration
			rows.StructScan(&cur)
			if err != nil {
				return models.Integration{}, err
			} else {
				return cur, nil
			}
		}
	}
	return models.Integration{}, nil
}

func (store *integrationStore) DeleteIntegration(ctx context.Context, accountId string, integrationName string) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = deleteIntegration
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, accountId, integrationName)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not delete integration")
	}
	return nil
}

var deleteIntegration = `
delete from integrations 
where account_id = $1 and name = $2;
`

func (ps *integrationStore) CheckTasksForIntegration(context context.Context, accountId string, integrationName string) (bool, error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		var count int
		err := conn.QueryRow(checkTasks, integrationName).Scan(&count)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return false, err
		}
		if count > 0 {
			return true, nil
		}
		return false, nil
	}
	return false, errors.New("driver not supported")
}

var checkTasks = `
SELECT count(*) FROM tasks
WHERE integration = $1;
`

func (ps *integrationStore) CheckTriggersForIntegration(context context.Context, accountId string, integrationName string) (bool, error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		var count int
		err := conn.QueryRow(checkTriggers, integrationName).Scan(&count)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return false, err
		}
		if count > 0 {
			return true, nil
		}
		return false, nil
	}
	return false, errors.New("driver not supported")
}

var checkTriggers = `
SELECT count(*) FROM event_triggers
WHERE integration = $1;
`
