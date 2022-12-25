package uiExtensionService

import (
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ue *uiExtensionService) ListExtensions(accountId, projectTag string) ([]models.UIExtension, error) {
	return ue.Store.ListExtensions(noContext, accountId, projectTag)
}
