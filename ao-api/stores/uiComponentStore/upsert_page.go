package uiComponentStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *uiComponentStore) UpsertComponent(ctx context.Context, page models.UIComponent) error {
	upsertPage := `
	INSERT INTO ui_custom_components (name, account_id, project_tag, content, status, category)
	VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (name, account_id, project_tag) DO UPDATE SET content = EXCLUDED.content, status = EXCLUDED.status
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertPage
	default:
		return fmt.Errorf("driver not supported")
	}
	logrus.Println(page.Content)
	_, err := store.db.Connection.Exec(stmt, page.Name, page.AccountId, page.ProjectTag, page.Content, page.Status, page.Category)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return nil
}
