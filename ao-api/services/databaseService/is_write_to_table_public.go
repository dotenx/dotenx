package databaseService

import "context"

func (ds *databaseService) IsWriteToTablePublic(projectTag string, tableName string) (bool, error) {
	noContext := context.Background()
	return ds.Store.IsWriteToTablePublic(noContext, projectTag, tableName)
}
