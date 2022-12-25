package uiExtensionStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *uiExtensionStore) GetExtension(ctx context.Context, accountId, projectTag, extensionName string) (models.UIExtension, error) {
	getExtension := `
	SELECT * FROM ui_extension WHERE account_id = $1 AND project_tag = $2 AND name = $3
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getExtension
	default:
		return models.UIExtension{}, fmt.Errorf("driver not supported")
	}
	var extension models.UIExtension

	err := store.db.Connection.QueryRowx(stmt, accountId, projectTag, extensionName).StructScan(&extension)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("extension not found")
		}
	}
	return extension, err
}
