package databaseService

import (
	"context"
)

func (ds *databaseService) SelectRows(projectTag string, tableName string, columns []string, page int, size int) ([]map[string]interface{}, error) {
	noContext := context.Background()

	offset := (page - 1) * size

	cols := columns
	if len(columns) == 0 {
		cols = []string{"*"}
	}

	return ds.Store.SelectRows(noContext, projectTag, tableName, cols, offset, size)
}
