package triggerStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

type TriggerStore interface {
	AddTrigger(ctx context.Context, accountId string, trigger models.EventTrigger) error
	DeleteTrigger(ctx context.Context, accountId string, triggerName string) error
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
INSERT INTO event_triggers (account_id, type, name, integration, pipeline, endpoint, credentials)
VALUES ($1, $2, $3, $4, $5, $6, $7)
`

func (store *triggerStore) AddTrigger(ctx context.Context, accountId string, trigger models.EventTrigger) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = storeTrigger
	default:
		return fmt.Errorf("driver not supported")
	}
	js, _ := json.Marshal(trigger.Credentials)
	res, err := store.db.Connection.Exec(stmt, accountId, trigger.Type, trigger.Name,
		trigger.Integration, trigger.Pipeline, trigger.Endpoint, js)
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
select  type, name, integration, pipeline, endpoint, credentials from event_triggers 
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
			var cred []byte
			rows.Scan(&cur.Type, &cur.Name, &cur.Integration, &cur.Pipeline, &cur.Endpoint, &cred)
			json.Unmarshal(cred, &cur.Credentials)
			if err != nil {
				return nil, err
			}
			res = append(res, cur)
		}
	}
	return res, nil
}

var deleteTrigger = `
delete from event_triggers
where account_id = $1 and name = $2;
`

func (store *triggerStore) DeleteTrigger(ctx context.Context, accountId string, triggerName string) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = deleteTrigger
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, accountId, triggerName)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not delete trigger, try again")
	}
	return nil
}
