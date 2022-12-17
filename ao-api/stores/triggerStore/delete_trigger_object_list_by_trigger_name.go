package triggerStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
)

func (store *triggerStore) DeleteTriggerObjectListByTriggerName(ctx context.Context, accountId, projectName, pipelineName, triggerName string) error {

	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = deleteTriggerObjectListByTriggerNameStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, accountId, projectName, pipelineName, triggerName)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not delete trigger object list, try again")
	}
	return nil
}

var deleteTriggerObjectListByTriggerNameStmt = `
delete from trigger_checker 
where account_id = $1 and project_name = $2 and pipeline_name = $3 and trigger_name = $4 ;
`
