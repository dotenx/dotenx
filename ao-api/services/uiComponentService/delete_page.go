package uiComponentService

import (
	"context"
)

func (ps *uiComponentService) DeleteComponent(accountId, projectTag, pageName string) error {
	return ps.Store.DeleteComponent(context.Background(), accountId, projectTag, pageName)
}
