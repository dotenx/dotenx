package uibuilderStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

var upsertGlobalStatesStmt = `
INSERT INTO ui_builder_global_states (account_id, project_name, states)
VALUES ($1, $2, $3) ON CONFLICT (account_id, project_name) 
DO UPDATE SET states = $3;
`

func (store *uibuilderStore) UpsertGlobalStates(ctx context.Context, globalState models.GlobalState) error {

	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertGlobalStatesStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt, globalState.AccountId, globalState.ProjectName, pq.StringArray(globalState.States))
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return nil
}
