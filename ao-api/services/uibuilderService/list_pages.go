package uibuilderService

import (
	"context"
)

func (ps *uibuilderService) ListPages(accountId, projectTag string) ([]string, error) {
	return ps.Store.ListPages(context.Background(), accountId, projectTag)
}
