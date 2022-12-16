package objectstoreService

import "context"

func (ps *objectstoreService) SetUserGroups(accountId, projectTag, fileName string, userGroups []string) error {
	return ps.Store.SetUserGroups(context.Background(), accountId, projectTag, fileName, userGroups)
}
