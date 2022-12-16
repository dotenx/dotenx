package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
)

func (ds *databaseService) UpsertView(accountId string, projectName string, viewName string, tableName string, columns []string, filters databaseStore.ConditionGroup, jsonQuery map[string]interface{}, isPublic bool) error {
	noContext := context.Background()
	return ds.Store.UpsertView(noContext, accountId, projectName, viewName, tableName, columns, filters, jsonQuery, isPublic)
}
