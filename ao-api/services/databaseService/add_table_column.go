package databaseService

import "context"

func (ds *databaseService) AddTableColumn(accountId string, projectName string, tableName string, columnName string, columnType string) error {
	noContext := context.Background()

	// Add table column to database
	return ds.Store.AddTableColumn(noContext, accountId, projectName, tableName, columnName, columnType)
}
