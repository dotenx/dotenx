package triggerStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *triggerStore) UpdateTriggerObjectListByTriggerName(ctx context.Context, triggerChecker models.TriggerChecker) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = updateTriggerObjectListByTriggerNameStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, triggerChecker.List, triggerChecker.AccountId, triggerChecker.ProjectName, triggerChecker.PipelineName, triggerChecker.TriggerName)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not update trigger object list, try again")
	}
	return nil
}

var updateTriggerObjectListByTriggerNameStmt = `
update trigger_checker
set list = $1 
where account_id = $2 and project_name = $3 and pipeline_name = $4 and trigger_name = $5 ;
`
