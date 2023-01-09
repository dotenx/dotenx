package databaseService

import "context"

func (ds *databaseService) RunDatabaseQuery(projectTag string, query string) (map[string]interface{}, error) {
	noContext := context.Background()
	return ds.Store.RunDatabaseQuery(noContext, projectTag, query)
}
