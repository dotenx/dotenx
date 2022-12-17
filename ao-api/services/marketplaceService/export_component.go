package marketplaceService

import (
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/uiComponentService"
	"github.com/sirupsen/logrus"
)

func (ms *marketplaceService) ExportComponent(accountId, projectName, componentName string, componentService uiComponentService.UIcomponentService) (componentDto models.ExportableUIComponent, err error) {
	pages, err := componentService.GetExportableComponentByProjectName(accountId, projectName, componentName)
	if err != nil {
		logrus.Errorf("Error getting UI pages: %v", err)
		return
	}
	componentDto = models.ExportableUIComponent{
		Name:    componentName,
		Content: pages.Content,
	}
	return
}
