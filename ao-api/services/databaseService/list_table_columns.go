package databaseService

import "context"

func (ds *databaseService) ListTableColumns(accountId string, projectName string, tableName string) ([]string, error) {
	noContext := context.Background()

	return ds.Store.ListTableColumns(noContext, accountId, projectName, tableName)
}
