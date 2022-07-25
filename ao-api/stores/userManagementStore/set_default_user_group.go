package userManagementStore

import (
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (s *userManagementStore) SetDefaultUserGroup(db *dbPkg.DB, userGroup models.UserGroup) (err error) {
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = setDefaultFaules
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err = db.Connection.Exec(stmt)
	if err != nil {
		return err
	}
	_, err = db.Connection.Exec(setDefaultUserGroup, userGroup.Name)
	return err
}

var setDefaultFaules = `UPDATE user_group SET is_default = false`
var setDefaultUserGroup = `UPDATE user_group SET is_default = true WHERE name = $1`
