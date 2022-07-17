package databaseService

import "context"

func (ds *databaseService) InsertRow(tpAccountId string, projectTag string, tableName string, row map[string]interface{}) error {
	noContext := context.Background()

	// Insert a row to table
	return ds.Store.InsertRow(noContext, projectTag, tableName, row)
}
