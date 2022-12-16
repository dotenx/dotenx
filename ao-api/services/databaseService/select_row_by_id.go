package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (ds *databaseService) SelectRowById(tpAccountId string, projectTag string, tableName string, id int) (map[string]interface{}, error) {
	noContext := context.Background()
	useRowLevelSecurity := false
	if tpAccountId != "" {
		userGroup, err := ds.UserManagementService.GetUserGroupForUser(tpAccountId, projectTag)
		if err != nil {
			return nil, err
		}
		useRowLevelSecurity = !utils.CheckPermission("select", tableName, userGroup)
	}

	// Add table column to database
	return ds.Store.SelectRowById(noContext, useRowLevelSecurity, tpAccountId, projectTag, tableName, id)
}
