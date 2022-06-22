package databaseService

import "context"

func (ds *databaseService) InsertRow(projectTag string, tableName string, row map[string]string) error {
	noContext := context.Background()

	// Add table column to database
	return ds.Store.InsertRow(noContext, projectTag, tableName, row)
}
