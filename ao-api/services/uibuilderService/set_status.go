package uibuilderService

import (
	"context"
)

func (ps *uibuilderService) SetPageStatus(accountId, projectTag, pageName, status string, published, previewed bool) error {
	return ps.Store.SetPageStatus(context.Background(), accountId, projectTag, pageName, status, published, previewed)
}
