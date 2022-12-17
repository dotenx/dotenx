package uiComponentService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uiComponentService) GetExportableComponentByProjectName(accountId, projectTag, componentName string) (models.ExportableUIComponent, error) {
	return ps.Store.GetExportableComponentByProjectName(context.Background(), accountId, projectTag, componentName)
}
