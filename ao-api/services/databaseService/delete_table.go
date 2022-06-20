package databaseService

import "context"

func (ds *databaseService) DeleteTable(accountId string, projectName string, tableName string) error {
	noContext := context.Background()

	// Delete table from database
	return ds.Store.DeleteTable(noContext, accountId, projectName, tableName)
}
