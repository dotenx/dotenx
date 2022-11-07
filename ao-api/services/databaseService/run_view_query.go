package databaseService

import (
	"context"
	"errors"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (ds *databaseService) RunViewQuery(tpAccountId string, projectTag string, viewName string, page int, size int) (map[string]interface{}, error) {
	noContext := context.Background()
	offset := (page - 1) * size

	viewDetails, err := ds.Store.GetViewDetailsByProjectTag(noContext, projectTag, viewName)
	if err != nil {
		return nil, err
	}
	tableName, ok := viewDetails.JsonQuery["tableName"].(string)
	if !ok {
		return nil, errors.New("invalid json query saved on 'views' table")
	}

	useRowLevelSecurity := false
	if tpAccountId != "" {
		userGroup, err := ds.UserManagementService.GetUserGroupForUser(tpAccountId, projectTag)
		if err != nil {
			return nil, err
		}
		useRowLevelSecurity = !utils.CheckPermission("select", tableName, userGroup)
	}
	return ds.Store.RunViewQuery(noContext, useRowLevelSecurity, tpAccountId, projectTag, viewName, offset, size)
}
