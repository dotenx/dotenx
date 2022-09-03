package pipelineStore

import (
	"context"
	"database/sql"
	"errors"

	"github.com/dotenx/dotenx/ao-api/db"
)

/*
This function deletes all the pipelines in a project.
Each pipeline can have multiple dependencies (executions, tasks, task_preconditions, and triggers), all of which are deleted as well, relying on ON DELETE CASCADE triggers.
*/

func (ps *pipelineStore) DeleteAllPipelines(context context.Context, accountId, projectName string) (err error) {

	deletePipelines := `DELETE FROM pipelines WHERE account_id = $1 AND project_name = $2`

	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		_, err = conn.Exec(deletePipelines, accountId, projectName)
		if err != nil && err != sql.ErrNoRows {
			return err
		}
		return nil
	default:
		return errors.New("driver not supported")
	}
}
