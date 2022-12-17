package uibuilderStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *uibuilderStore) GetExportablePageByProjectName(ctx context.Context, accountId, projectName string) ([]models.ExportableUIPage, error) {
	getPages := `
	SELECT ui_pages.name, content FROM ui_pages 
	JOIN projects ON projects.tag = ui_pages.project_tag 
	WHERE projects.account_id = $1 AND projects.name = $2
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getPages
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	var pages []models.ExportableUIPage
	err := store.db.Connection.Select(&pages, stmt, accountId, projectName)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}
	return pages, nil
}
