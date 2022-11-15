package uibuilderStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (store *uibuilderStore) ListAllPagesOfUser(ctx context.Context, accountId string) ([]string, error) {
	listPagesOfUser := `
	SELECT name FROM ui_pages WHERE account_id = $1;
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = listPagesOfUser
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	var pages []string
	err := store.db.Connection.Select(&pages, stmt, accountId)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}
	return pages, nil
}
