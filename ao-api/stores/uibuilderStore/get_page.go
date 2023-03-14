package uibuilderStore

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (store *uibuilderStore) GetPage(ctx context.Context, accountId, projectTag, pageName string) (models.UIPage, error) {
	selectPage := `
	SELECT * FROM ui_pages WHERE account_id = $1 AND project_tag = $2 AND name = $3
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = selectPage
	default:
		return models.UIPage{}, fmt.Errorf("driver not supported")
	}
	var page models.UIPage

	err := store.db.Connection.QueryRowx(stmt, accountId, projectTag, pageName).StructScan(&page)
	if err != nil {
		logrus.Error(err)
		if err == sql.ErrNoRows {
			err = utils.ErrPageNotFound
		}
	}
	return page, err
}
