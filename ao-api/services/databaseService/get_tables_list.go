package databaseService

import "context"

func (ds *databaseService) GetTablesList(accountId string, projectName string) ([]string, error) {
	noContext := context.Background()

	return ds.Store.GetTablesList(noContext, accountId, projectName)
}
