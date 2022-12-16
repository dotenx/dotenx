package uiComponentService

import (
	"context"
)

func (ps *uiComponentService) SetComponentStatus(accountId, projectTag, pageName, status string) error {
	return ps.Store.SetComponentStatus(context.Background(), accountId, projectTag, pageName, status)
}
