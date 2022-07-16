package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
)

func (ds *databaseService) ListTableColumns(accountId string, projectName string, tableName string) ([]databaseStore.PgColumn, error) {
	noContext := context.Background()

	return ds.Store.ListTableColumns(noContext, accountId, projectName, tableName)
}
