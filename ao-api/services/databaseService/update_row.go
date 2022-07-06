package databaseService

import "context"

func (ds *databaseService) UpdateRow(projectTag string, tableName string, id int, row map[string]interface{}) error {
	noContext := context.Background()

	// Insert a row to table
	return ds.Store.UpdateRow(noContext, projectTag, tableName, id, row)
}
