package uibuilderService

import (
	"context"
)

func (ps *uibuilderService) SetPageStatus(accountId, projectTag, pageName, status string) error {
	return ps.Store.SetPageStatus(context.Background(), accountId, projectTag, pageName, status)
}
