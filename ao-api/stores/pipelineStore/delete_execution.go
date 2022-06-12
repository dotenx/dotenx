package pipelineStore

import (
	"context"
	"database/sql"
	"errors"

	"github.com/dotenx/dotenx/ao-api/db"
)

func (ps *pipelineStore) DeleteExecution(context context.Context, id int) (err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		_, err = conn.Exec(deleteExecuion, id)
		if err != nil && err != sql.ErrNoRows {
			return err
		}
		return nil
	}
	return errors.New("driver not supported")
}

var deleteExecuion = `delete from executions where id = $1;`
