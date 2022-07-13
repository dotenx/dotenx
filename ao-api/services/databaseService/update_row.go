package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (ds *databaseService) UpdateRow(tpAccountId string, projectTag string, tableName string, id int, row map[string]interface{}) error {
	noContext := context.Background()
	useRowLevelSecurity := false
	if tpAccountId != "" {
		userGroup, err := ds.UserManagementService.GetUserGroupForUser(tpAccountId, projectTag)
		if err != nil {
			return err
		}
		useRowLevelSecurity = !utils.CheckPermission("update", tableName, userGroup)
	}

	// Insert a row to table
	return ds.Store.UpdateRow(noContext, useRowLevelSecurity, tpAccountId, projectTag, tableName, id, row)
}
