package uiComponentStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *uiComponentStore) ListComponents(ctx context.Context, accountId, projectTag string) ([]models.UIComponent, error) {
	listPages := `
	SELECT name, content, category FROM ui_custom_components WHERE account_id = $1 AND project_tag = $2
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = listPages
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	var pages []models.UIComponent
	err := store.db.Connection.Select(&pages, stmt, accountId, projectTag)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}
	return pages, nil
}
