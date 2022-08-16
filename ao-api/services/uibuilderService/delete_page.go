package uibuilderService

import (
	"context"
)

func (ps *uibuilderService) DeletePage(accountId, projectTag, pageName string) error {
	return ps.Store.DeletePage(context.Background(), accountId, projectTag, pageName)
}
