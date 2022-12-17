package uibuilderService

import "context"

func (ps *uibuilderService) ListAllPagesOfUser(accountId string) ([]string, error) {
	return ps.Store.ListAllPagesOfUser(context.Background(), accountId)
}
