package uiExtensionStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *uiExtensionStore) GetExportableExtensionByProjectName(ctx context.Context, accountId, projectName, extensionName string) (models.ExportableUIExtension, error) {
	getExtensions := `
	SELECT ui_extension.name, ui_extension.content, ui_extension.category FROM ui_extension
	JOIN projects ON projects.tag = ui_extension.project_tag 
	WHERE projects.account_id = $1 AND projects.name = $2 AND ui_extension.name = $3;
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getExtensions
	default:
		return models.ExportableUIExtension{}, fmt.Errorf("driver not supported")
	}
	var extensions []models.ExportableUIExtension
	err := store.db.Connection.Select(&extensions, stmt, accountId, projectName, extensionName)
	if err != nil {
		logrus.Error(err.Error())
		return models.ExportableUIExtension{}, err
	}
	if len(extensions) <= 0 {
		return models.ExportableUIExtension{}, fmt.Errorf("extension not found")
	}
	return extensions[0], nil
}
