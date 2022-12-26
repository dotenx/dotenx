package uiExtensionService

import (
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ue *uiExtensionService) UpsertExtension(extension models.UIExtension) error {
	return ue.Store.UpsertExtension(noContext, extension)
}
