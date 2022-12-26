package uiExtensionStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (store *uiExtensionStore) DeleteExtension(ctx context.Context, accountId, projectTag, extensionName string) error {
	deleteExtension := `
	DELETE FROM ui_extension WHERE account_id = $1 AND project_tag = $2 AND name = $3
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = deleteExtension
	default:
		return fmt.Errorf("driver not supported")
	}
	result, err := store.db.Connection.Exec(stmt, accountId, projectTag, extensionName)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("extension not found")
		}
		logrus.Error(err.Error())
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		logrus.Error("Error deleting extension:", err)
		err = errors.New("extension not found")
		return err
	}
	return nil
}
