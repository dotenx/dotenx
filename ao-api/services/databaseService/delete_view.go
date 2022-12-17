package databaseService

import "context"

func (ds *databaseService) DeleteView(accountId string, projectName string, viewName string) error {
	noContext := context.Background()
	return ds.Store.DeleteView(noContext, accountId, projectName, viewName)
}
