package marketplaceService

import (
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/uiExtensionService"
	"github.com/sirupsen/logrus"
)

func (ms *marketplaceService) ExportUIExtension(accountId, projectName, extensionName string, extensionService uiExtensionService.UIExtensionService) (extensionDto models.ExportableUIExtension, err error) {
	extension, err := extensionService.GetExportableExtensionByProjectName(accountId, projectName, extensionName)
	if err != nil {
		logrus.Errorf("Error getting UI extension: %v", err)
		return
	}
	extensionDto = models.ExportableUIExtension{
		Name:    extensionName,
		Content: extension.Content,
	}
	return
}
