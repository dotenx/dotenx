package userManagementStore

import (
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
)

func (store *userManagementStore) DeleteUserGroup(db *dbPkg.DB, name string) (err error) {
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = deleteUserGroup
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err = db.Connection.Exec(stmt, name)
	if err != nil {
		return err
	}
	return
}

var deleteUserGroup = `
DELETE FROM user_group
WHERE name = $1
`
