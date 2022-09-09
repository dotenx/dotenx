package userManagementStore

import (
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
)

func (store *userManagementStore) CreateSecurityCodeTable(db *dbPkg.DB) (err error) {
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = createSecurityCodeTableStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err = db.Connection.Exec(stmt)
	if err != nil {
		return err
	}
	return
}

var createSecurityCodeTableStmt = `
CREATE TABLE IF NOT EXISTS security_code (
email                   VARCHAR(64),
security_code           VARCHAR(64),
expiration_time         INTEGER,
usable                  BOOLEAN,
use_case                VARCHAR(64),
UNIQUE (security_code)
)
`
