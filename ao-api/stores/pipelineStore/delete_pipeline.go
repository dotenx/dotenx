package pipelineStore

import (
	"context"
	"database/sql"
	"errors"

	"github.com/dotenx/dotenx/ao-api/db"
)

func (ps *pipelineStore) DeletePipeline(context context.Context, accountId, name, projectName string) (err error) {

	var deletePipeline = `delete from pipelines where account_id = $1 and name = $2 and project_name = $3;`

	// TODO: This is unnecessary, we can just delete the pipeline and let the triggers cascade
	var deleteTriggers = `delete from event_triggers
where account_id = $1 and pipeline = $2 and project_name = $3;`

	var deleteTriggerObjectListsStmt = `
delete from trigger_checker 
where account_id = $1 and pipeline_name = $2 and project_name = $3;`

	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		_, err = conn.Exec(deletePipeline, accountId, name, projectName)
		if err != nil && err != sql.ErrNoRows {
			return err
		}
		_, err = conn.Exec(deleteTriggers, accountId, name, projectName)
		if err != nil && err != sql.ErrNoRows {
			return err
		}
		_, err = conn.Exec(deleteTriggerObjectListsStmt, accountId, name, projectName)
		if err != nil && err != sql.ErrNoRows {
			return err
		}
		return nil
	default:
		return errors.New("driver not supported")
	}
}
