package databaseService

import "context"

func (ds *databaseService) DeleteDatabaseUser(accountId string, projectName string) error {
	noContext := context.Background()
	return ds.Store.DeleteDatabaseUser(noContext, accountId, projectName)
}
