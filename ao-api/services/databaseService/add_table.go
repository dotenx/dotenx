package databaseService

import "context"

func (ds *databaseService) AddTable(accountId string, projectName string, tableName string, isPublic bool) error {
	noContext := context.Background()

	// Add table to database
	return ds.Store.AddTable(noContext, accountId, projectName, tableName, isPublic)
}
