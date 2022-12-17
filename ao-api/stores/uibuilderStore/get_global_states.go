package uibuilderStore

import (
	"context"
	"database/sql"
	"errors"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/lib/pq"
)

var getGlobalStatesStmt = `
SELECT account_id, project_name, states FROM ui_builder_global_states 
WHERE account_id = $1 AND project_name = $2;
`

func (store *uibuilderStore) GetGlobalStates(ctx context.Context, accountId, projectName string) (models.GlobalState, error) {

	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getGlobalStatesStmt
	default:
		return models.GlobalState{}, errors.New("driver not supported")
	}

	var globalState models.GlobalState
	var states pq.StringArray
	err := store.db.Connection.QueryRowx(stmt, accountId, projectName).Scan(&globalState.AccountId, &globalState.ProjectName, &states)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("states not found")
		}
	}
	globalState.States = ([]string)(states)
	return globalState, err
}
