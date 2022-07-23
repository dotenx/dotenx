package userManagementStore

import (
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (s *userManagementStore) GetDefaultUserGroup(db *dbPkg.DB) (userGroup *models.UserGroup, err error) {
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = getDefaultUserGroup
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	err = db.Connection.QueryRow(stmt).Scan(&userGroup.Name)
	return userGroup, err
}

var getDefaultUserGroup = `SELECT name from user_group where is_default = true`
