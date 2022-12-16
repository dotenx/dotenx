package triggerStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *triggerStore) AddTriggerObjectList(ctx context.Context, triggerChecker models.TriggerChecker) error {

	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = insertTriggerObjectListStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, triggerChecker.AccountId, triggerChecker.ProjectName, triggerChecker.PipelineName, triggerChecker.TriggerName, triggerChecker.List)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not insert trigger object list, try again")
	}
	return nil
}

var insertTriggerObjectListStmt = `
insert into trigger_checker (account_id, project_name, pipeline_name, trigger_name, list)
values ($1, $2, $3, $4, $5)
`
