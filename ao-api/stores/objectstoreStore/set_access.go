package objectstoreStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (ds *objectstoreStore) SetAccess(ctx context.Context, accountId, projectTag, fileName, newUrl string, isPublic bool) error {
	setAccess := `
UPDATE object_store
SET is_public = $1, url = $2
WHERE account_id = $3 AND project_tag = $4 AND key = $5
`

	var stmt string
	switch ds.db.Driver {
	case db.Postgres:
		stmt = setAccess
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := ds.db.Connection.Exec(stmt, isPublic, newUrl, accountId, projectTag, fileName)
	if err != nil {
		logrus.Error(err.Error())
		if err.Error() == "sql: no rows in result set" {
			err = fmt.Errorf("entity not found")
		}
		return err
	}
	return nil
}
