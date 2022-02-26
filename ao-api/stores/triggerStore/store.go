package triggerStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

type TriggerStore interface {
	AddTrigger(ctx context.Context, accountId string, trigger models.EventTrigger) error
	GetTriggersByType(ctx context.Context, accountId, triggerType string) ([]models.EventTrigger, error)
	GetAllTriggers(ctx context.Context, accountId string) ([]models.EventTrigger, error)
}

type triggerStore struct {
	db *db.DB
}

func New(db *db.DB) TriggerStore {
	return &triggerStore{db: db}
}

var storeTrigger = `
INSERT INTO event_triggers (account_id, type, name, integration, endpoint, credentials)
VALUES ($1, $2, $3, $4, $5, $6)
`

func (store *triggerStore) AddTrigger(ctx context.Context, accountId string, trigger models.EventTrigger) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = storeTrigger
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, accountId, trigger.Type, trigger.Name,
		trigger.Integration, trigger.Endpoint, trigger.Credentials)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not add trigger, try again")
	}
	return nil
}

var getTriggersByType = `
select * from event_triggers 
where account_id = $1 and type = $2;
`

func (store *triggerStore) GetTriggersByType(ctx context.Context, accountId, triggerType string) ([]models.EventTrigger, error) {
	res := make([]models.EventTrigger, 0)
	switch store.db.Driver {
	case db.Postgres:
		conn := store.db.Connection
		rows, err := conn.Queryx(getTriggersByType, accountId, triggerType)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return nil, err
		}
		for rows.Next() {
			var cur models.EventTrigger
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
select * from event_triggers 
where account_id = $1;
`

func (store *triggerStore) GetAllTriggers(ctx context.Context, accountId string) ([]models.EventTrigger, error) {
	res := make([]models.EventTrigger, 0)
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
			var cur models.EventTrigger
			rows.StructScan(&cur)
			if err != nil {
				return nil, err
			}
			res = append(res, cur)
		}
	}
	return res, nil
}
