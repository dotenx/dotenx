package uiExtensionStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *uiExtensionStore) UpsertExtension(ctx context.Context, extension models.UIExtension) error {
	upsertExtension := `
	INSERT INTO ui_extension (name, account_id, project_tag, content, status, category)
	VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (name, account_id, project_tag) 
		DO UPDATE SET content = EXCLUDED.content, status = EXCLUDED.status
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertExtension
	default:
		return fmt.Errorf("driver not supported")
	}
	logrus.Println(extension.Content)
	_, err := store.db.Connection.Exec(stmt, extension.Name, extension.AccountId, extension.ProjectTag, extension.Content, extension.Status, extension.Category)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return nil
}
