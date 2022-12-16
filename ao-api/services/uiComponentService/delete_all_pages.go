package uiComponentService

import (
	"context"
)

func (ps *uiComponentService) DeleteAllComponents(accountId, projectTag string) error {
	return ps.Store.DeleteAllComponents(context.Background(), accountId, projectTag)
}
