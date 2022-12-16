package objectstoreService

import (
	"context"
)

func (ps *objectstoreService) DeleteObject(accountId, tpAccountId, projectTag, fileName string) error {
	return ps.Store.DeleteObject(context.Background(), accountId, tpAccountId, projectTag, fileName)
}
