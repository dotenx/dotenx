package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (ds *databaseService) DeleteRow(tpAccountId string, projectTag string, tableName string, id int) error {
	noContext := context.Background()
	useRowLevelSecurity := false
	if tpAccountId != "" {
		userGroup, err := ds.UserManagementService.GetUserGroupForUser(tpAccountId, projectTag)
		if err != nil {
			return err
		}
		useRowLevelSecurity = !utils.CheckPermission("delete", tableName, userGroup)
	}
	// Add table column to database
	return ds.Store.DeleteRow(noContext, useRowLevelSecurity, tpAccountId, projectTag, tableName, id)
}
