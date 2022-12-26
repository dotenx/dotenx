package uiExtensionService

import "context"

func (ue *uiExtensionService) DeleteExtension(accountId, projectTag, extensionName string) error {
	return ue.Store.DeleteExtension(context.Background(), accountId, projectTag, extensionName)
}
