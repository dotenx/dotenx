package pipelineStore

import (
	"context"
	"database/sql"
	"errors"

	"github.com/dotenx/dotenx/ao-api/db"
)

func (ps *pipelineStore) DeleteExecution(context context.Context, id int) (err error) {
	deleteExecution := `delete from executions where id = $1;`

	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		_, err = conn.Exec(deleteExecution, id)
		if err != nil && err != sql.ErrNoRows {
			return err
		}
		return nil
	default:
		return errors.New("driver not supported")
	}
}
