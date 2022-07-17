package pipelineStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
)

var setTaskExecutionDone = `
UPDATE executions 
   SET is_execution_done = $2
WHERE id = $1;
`

func (store *pipelineStore) SetExecutionDone(ctx context.Context, execId int) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = setTaskExecutionDone
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, execId, true)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not set execution done")
	}
	return nil

}
