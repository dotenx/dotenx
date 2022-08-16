package uibuilderStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (store *uibuilderStore) DeletePage(ctx context.Context, accountId, projectTag, pageName string) error {
	upsertPage := `
	DELETE FROM ui_pages WHERE account_id = $1 AND project_tag = $2 AND name = $3
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertPage
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt, accountId, projectTag, pageName)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return nil
}
