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

func (store *uibuilderStore) GetPageHistory(ctx context.Context, accountId, projectTag, pageName string) ([]models.UIPageHistory, error) {
	selectPages := `
	SELECT * FROM ui_pages_history
	WHERE account_id = $1 AND project_tag = $2 AND name = $3
	ORDER BY saved_at;
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = selectPages
	default:
		return nil, fmt.Errorf("driver not supported")
	}

	var pages []models.UIPageHistory
	err := store.db.Connection.Select(&pages, stmt, accountId, projectTag, pageName)
	if err != nil {
		logrus.Error(err)
		if err == sql.ErrNoRows {
			err = utils.ErrPageNotFound
		}
		return nil, err
	}

	return pages, nil
}
