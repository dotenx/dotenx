package databaseService

import "context"

func (ds *databaseService) SetTableAccess(accountId, projectName, tableName string, isPublic bool) error {
	noContext := context.Background()
	return ds.Store.SetTableAccess(noContext, accountId, projectName, tableName, isPublic)
}
