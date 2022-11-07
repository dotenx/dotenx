package databaseStore

import (
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
)

var createViewsTableStmt = `
CREATE TABLE IF NOT EXISTS views (
name                    VARCHAR(64) PRIMARY KEY,
query                   TEXT,
query_as_json           JSONB,
values                  JSONB,
is_public               BOOLEAN DEFAULT FALSE
)
`

func (ds *databaseStore) CreateViewsTable(db *dbPkg.DB) (err error) {
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = createViewsTableStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err = db.Connection.Exec(stmt)
	if err != nil {
		return err
	}
	return
}
