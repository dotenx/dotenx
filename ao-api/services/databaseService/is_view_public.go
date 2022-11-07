package databaseService

import "context"

func (ds *databaseService) IsViewPublic(projectTag string, viewName string) (bool, error) {
	noContext := context.Background()
	return ds.Store.IsViewPublic(noContext, projectTag, viewName)
}
