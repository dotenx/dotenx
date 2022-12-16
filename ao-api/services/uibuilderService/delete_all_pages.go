package uibuilderService

import (
	"context"
)

func (ps *uibuilderService) DeleteAllPages(accountId, projectTag string) error {
	return ps.Store.DeleteAllPages(context.Background(), accountId, projectTag)
}
