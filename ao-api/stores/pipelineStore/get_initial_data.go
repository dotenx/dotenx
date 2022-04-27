package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *pipelineStore) GetInitialData(context context.Context, executionId int, accountId string) (InitialData models.InputData, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.Get(&InitialData, getInitialData, executionId, accountId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				return nil, errors.New("not found")
			}
		}
	}
	return
}

func (ps *pipelineStore) UpdateInitialData(context context.Context, execId int, initialData models.InputData) error {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		res, err := conn.Exec(updateInitialData, execId, initialData)
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

var getInitialData = `
SELECT initial_data FROM executions e
JOIN pipelines pv ON pv.id = e.pipeline_id
WHERE e.id = $1 AND pv.account_id = $2
`

var updateInitialData = `
UPDATE executions
SET initial_data=$2
WHERE id = $1
`
