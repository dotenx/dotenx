package userManagementStore

import (
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
)

func (store *userManagementStore) CreateUserInfoTable(db *dbPkg.DB) (err error) {
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = createUserInfoTableStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err = db.Connection.Exec(stmt)
	if err != nil {
		return err
	}
	return
}

var createUserInfoTableStmt = `
CREATE TABLE IF NOT EXISTS user_info (
account_id              VARCHAR(64) PRIMARY KEY,
password                VARCHAR(128),
fullname                VARCHAR(64),
email                   VARCHAR(64),
created_at              VARCHAR(64),
role 				    VARCHAR(64)
)
`
