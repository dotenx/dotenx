package pipelineStore

import (
	"context"
	"database/sql"
	"errors"

	"github.com/dotenx/dotenx/ao-api/db"
)

func (ps *pipelineStore) DeletePipeline(context context.Context, accountId, name string) (err error) {

	var deletePipeline = `delete from pipelines where account_id = $1 and name = $2`

	// TODO: This is unnecessary, we can just delete the pipeline and let the triggers cascade
	var deleteTriggers = `delete from event_triggers
where account_id = $1 and pipeline = $2;`

	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		_, err = conn.Exec(deletePipeline, accountId, name)
		if err != nil && err != sql.ErrNoRows {
			return err
		}
		_, err = conn.Exec(deleteTriggers, accountId, name)
		if err != nil && err != sql.ErrNoRows {
			return err
		}
		return nil
	default:
		return errors.New("driver not supported")
	}
}
