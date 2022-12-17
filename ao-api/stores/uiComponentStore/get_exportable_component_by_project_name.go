package uiComponentStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *uiComponentStore) GetExportableComponentByProjectName(ctx context.Context, accountId, projectName, componentName string) (models.ExportableUIComponent, error) {
	getPages := `
	SELECT ui_custom_components.name, content, category FROM ui_custom_components
	JOIN projects ON projects.tag = ui_custom_components.project_tag 
	WHERE projects.account_id = $1 AND projects.name = $2 AND ui_custom_components.name = $3
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getPages
	default:
		return models.ExportableUIComponent{}, fmt.Errorf("driver not supported")
	}
	var pages []models.ExportableUIComponent
	err := store.db.Connection.Select(&pages, stmt, accountId, projectName, componentName)
	if err != nil {
		logrus.Error(err.Error())
		return models.ExportableUIComponent{}, err
	}
	if len(pages) <= 0 {
		return models.ExportableUIComponent{}, fmt.Errorf("no component found")
	}
	return pages[0], nil
}
