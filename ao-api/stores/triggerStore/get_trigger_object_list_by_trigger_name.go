package triggerStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *triggerStore) GetTriggerObjectListByTriggerName(ctx context.Context, accountId, projectName, pipelineName, triggerName string) (list models.TriggerObjectList, err error) {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getTriggerObjectListByTriggerNameStmt
	default:
		return nil, fmt.Errorf("driver not supported")
	}

	err = store.db.Connection.Get(&list, stmt, accountId, projectName, pipelineName, triggerName)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("trigger object list not found")
		}
		return nil, err
	}
	return
}

var getTriggerObjectListByTriggerNameStmt = `
select list from trigger_checker 
where account_id = $1 and project_name = $2 and pipeline_name = $3 and trigger_name = $4 ;
`
