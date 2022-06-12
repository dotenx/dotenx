package pipelineStore

import (
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
)

var updateexecTime = `
UPDATE executions 
   SET execution_time = $2
WHERE id = $1;
`

func (store *pipelineStore) SetExecutionTime(execId, seconds int) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = updateexecTime
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, execId, seconds)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not set execution time")
	}
	return nil

}
