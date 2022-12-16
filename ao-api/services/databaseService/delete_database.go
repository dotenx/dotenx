package databaseService

import "context"

func (ds *databaseService) DeleteDatabase(accountId string, projectName string) error {
	noContext := context.Background()
	return ds.Store.DeleteDatabase(noContext, accountId, projectName)
}
