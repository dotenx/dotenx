package objectstoreService

import "context"

func (ps *objectstoreService) SetAccess(accountId, projectTag, fileName, newUrl string, isPublic bool) error {
	return ps.Store.SetAccess(context.Background(), accountId, projectTag, fileName, newUrl, isPublic)
}
