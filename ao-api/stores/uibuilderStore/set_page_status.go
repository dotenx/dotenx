package uibuilderStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (store *uibuilderStore) SetPageStatus(ctx context.Context, accountId, projectTag, pageName, status string) error {
	upsertPage := `
	UPDATE ui_pages SET status = $1 WHERE account_id = $2 AND project_tag = $3 AND name = $4
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertPage
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt, status, accountId, projectTag, pageName)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return nil
}
