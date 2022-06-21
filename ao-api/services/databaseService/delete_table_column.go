package databaseService

import "context"

func (ds *databaseService) DeleteTableColumn(accountId string, projectName string, tableName string, columnName string) error {
	noContext := context.Background()

	// Delete table column from database
	return ds.Store.DeleteTableColumn(noContext, accountId, projectName, tableName, columnName)
}
