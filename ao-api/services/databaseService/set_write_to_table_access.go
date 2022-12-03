package databaseService

import "context"

func (ds *databaseService) SetWriteToTableAccess(accountId, projectName, tableName string, isWritePublic bool) error {
	noContext := context.Background()
	return ds.Store.SetWriteToTableAccess(noContext, accountId, projectName, tableName, isWritePublic)
}
