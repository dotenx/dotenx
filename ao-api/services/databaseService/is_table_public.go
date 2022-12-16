package databaseService

import "context"

func (ds *databaseService) IsTablePublic(projectTag string, tableName string) (bool, error) {
	noContext := context.Background()

	return ds.Store.IsTablePublic(noContext, projectTag, tableName)
}
