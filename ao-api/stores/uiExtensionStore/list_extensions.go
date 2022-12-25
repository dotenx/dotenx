package uiExtensionStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *uiExtensionStore) ListExtensions(ctx context.Context, accountId, projectTag string) ([]models.UIExtension, error) {
	listExtensions := `
	SELECT name, content, category FROM ui_extension WHERE account_id = $1 AND project_tag = $2
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = listExtensions
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	var extensions []models.UIExtension
	err := store.db.Connection.Select(&extensions, stmt, accountId, projectTag)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}
	return extensions, nil
}
