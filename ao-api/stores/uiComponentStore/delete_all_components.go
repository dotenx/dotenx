package uiComponentStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (store *uiComponentStore) DeleteAllComponents(ctx context.Context, accountId, projectTag string) error {
	deleteAllPages := `
	DELETE FROM ui_custom_components WHERE account_id = $1 AND project_tag = $2
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = deleteAllPages
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt, accountId, projectTag)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return fmt.Errorf("entity not found")
		}
		logrus.Error(err.Error())
		return err
	}
	return nil
}
