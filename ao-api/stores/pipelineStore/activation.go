package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
)

func (ps *pipelineStore) ActivatePipeline(context context.Context, accountId, pipelineId string) error {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		res, err := conn.Exec(setActive, accountId, pipelineId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				return errors.New("pipeline not found")
			}
			return err
		}
		ef, err := res.RowsAffected()
		if err != nil {
			return err
		}
		if ef == 0 {
			return errors.New("error in setting workspace")
		}
		return nil
	}
	return nil

}

func (ps *pipelineStore) DeActivatePipeline(context context.Context, accountId, pipelineId string) error {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		res, err := conn.Exec(setDeActive, accountId, pipelineId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				return errors.New("pipeline not found")
			}
			return err
		}
		ef, err := res.RowsAffected()
		if err != nil {
			return err
		}
		if ef == 0 {
			return errors.New("error in setting workspace")
		}
		return nil
	}
	return nil

}

var setActive = `
UPDATE pipelines
SET is_active=TRUE
WHERE account_id = $1 and id=$2
`

var setDeActive = `
UPDATE pipelines
SET is_active=FALSE
WHERE account_id = $1 and id=$2
`
