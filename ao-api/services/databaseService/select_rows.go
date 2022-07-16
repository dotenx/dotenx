package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
)

func (ds *databaseService) SelectRows(projectTag string, tableName string, columns []string, filters databaseStore.ConditionGroup, page int, size int) ([]map[string]interface{}, error) {
	noContext := context.Background()

	offset := (page - 1) * size

	cols := columns
	if len(columns) == 0 {
		cols = []string{"*"}
	}

	return ds.Store.SelectRows(noContext, projectTag, tableName, cols, filters, offset, size)
}
