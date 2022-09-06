package uiComponentStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *uiComponentStore) GetUiInfrastructure(ctx context.Context, accountId, projectTag string) (models.UiInfrastructure, error) {
	upsertPage := `
	SELECT * FROM project_ui_infrastructure WHERE account_id = $1 AND project_tag = $2
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertPage
	default:
		return models.UiInfrastructure{}, fmt.Errorf("driver not supported")
	}
	var uiInfrastructure models.UiInfrastructure

	err := store.db.Connection.QueryRowx(stmt, accountId, projectTag).StructScan(&uiInfrastructure)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("not found")
		}
	}
	return uiInfrastructure, err
}
