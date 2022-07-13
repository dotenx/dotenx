package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
)

func (ds *databaseService) SelectRows(tpAccountId string, projectTag string, tableName string, columns []string, filters databaseStore.ConditionGroup, page int, size int) ([]map[string]interface{}, error) {
	noContext := context.Background()

	offset := (page - 1) * size

	cols := columns
	if len(columns) == 0 {
		cols = []string{"*"}
	}
	useRowLevelSecurity := false
	if tpAccountId != "" {
		userGroup, err := ds.UserManagementService.GetUserGroupForUser(tpAccountId, projectTag)
		if err != nil {
			return nil, err
		}
		useRowLevelSecurity = !utils.CheckPermission("select", tableName, userGroup)
	}

	return ds.Store.SelectRows(noContext, useRowLevelSecurity, tpAccountId, projectTag, tableName, cols, filters, offset, size)
}
