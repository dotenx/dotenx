package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ds *databaseService) ListTableColumns(accountId string, projectName string, tableName string) ([]models.PgColumn, error) {
	noContext := context.Background()

	return ds.Store.ListTableColumns(noContext, accountId, projectName, tableName)
}
