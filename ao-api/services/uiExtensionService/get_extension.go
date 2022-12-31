package uiExtensionService

import (
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ue *uiExtensionService) GetExtension(accountId, projectTag, extensionName string) (models.UIExtension, error) {
	return ue.Store.GetExtension(noContext, accountId, projectTag, extensionName)
}
