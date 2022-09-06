package uiComponentStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *uiComponentStore) GetComponent(ctx context.Context, accountId, projectTag, pageName string) (models.UIComponent, error) {
	upsertPage := `
	SELECT * FROM ui_custom_components WHERE account_id = $1 AND project_tag = $2 AND name = $3
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertPage
	default:
		return models.UIComponent{}, fmt.Errorf("driver not supported")
	}
	var page models.UIComponent

	err := store.db.Connection.QueryRowx(stmt, accountId, projectTag, pageName).StructScan(&page)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("page not found")
		}
	}
	return page, err
}
