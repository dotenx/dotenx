package databaseService

import "context"

func (ds *databaseService) DeleteRow(projectTag string, tableName string, id int) error {
	noContext := context.Background()

	// Add table column to database
	return ds.Store.DeleteRow(noContext, projectTag, tableName, id)
}
