package objectstoreStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (ds *objectstoreStore) DeleteObject(ctx context.Context, accountId, tpAccountId, projectTag, fileName string) error {
	deleteObject := `
DELETE FROM object_store
WHERE account_id = $1 AND project_tag = $2 AND key = $3
`

	var stmt string
	switch ds.db.Driver {
	case db.Postgres:
		stmt = deleteObject
	default:
		return fmt.Errorf("driver not supported")
	}

	var err error
	if tpAccountId != "" {
		stmt += " AND tpaccount_id = $4"
		_, err = ds.db.Connection.Exec(stmt, accountId, projectTag, fileName, tpAccountId)
	} else {
		_, err = ds.db.Connection.Exec(stmt, accountId, projectTag, fileName)

	}
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			err = fmt.Errorf("entity not found")
		} else {
			logrus.Error(err.Error())
		}
		return err
	}
	return nil
}
