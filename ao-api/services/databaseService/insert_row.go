package databaseService

import "context"

func (ds *databaseService) InsertRow(projectTag string, tableName string, row map[string]string) error {
	noContext := context.Background()

	// Insert a row to table
	return ds.Store.InsertRow(noContext, projectTag, tableName, row)
}
