package uibuilderStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (store *uibuilderStore) ListPages(ctx context.Context, accountId, projectTag string) ([]string, error) {
	upsertPage := `
	SELECT name FROM ui_pages WHERE account_id = $1 AND project_tag = $2
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertPage
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	var pages []string
	err := store.db.Connection.Select(&pages, stmt, accountId, projectTag)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}
	return pages, nil
}
