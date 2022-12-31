package uiExtensionService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uiExtensionService) GetExportableExtensionByProjectName(accountId, projectName, extensionName string) (models.ExportableUIExtension, error) {
	return ps.Store.GetExportableExtensionByProjectName(context.Background(), accountId, projectName, extensionName)
}
