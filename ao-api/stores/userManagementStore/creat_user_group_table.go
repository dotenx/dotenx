package userManagementStore

import (
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
)

func (store *userManagementStore) CreateUserGroupTable(db *dbPkg.DB) (err error) {
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = createUserGroupTableStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err = db.Connection.Exec(stmt)
	if err != nil {
		return err
	}
	return
}

var createUserGroupTableStmt = `
CREATE TABLE IF NOT EXISTS user_group (
name                       VARCHAR(128) PRIMARY KEY,
insert_list                JSONB,
delete_list                JSONB,
update_list                JSONB,
select_list                JSONB,
)
`
