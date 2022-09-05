package objectstoreStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

func (ds *objectstoreStore) SetUserGroups(ctx context.Context, accountId, projectTag, fileName string, userGroups []string) error {
	setUserGroup := `
UPDATE object_store
SET user_groups = $1
WHERE account_id = $2 AND project_tag = $3 AND key = $4
`

	var stmt string
	switch ds.db.Driver {
	case db.Postgres:
		stmt = setUserGroup
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := ds.db.Connection.Exec(stmt, pq.StringArray(userGroups), accountId, projectTag, fileName)
	if err != nil {
		logrus.Error(err.Error())
		if err.Error() == "sql: no rows in result set" {
			err = fmt.Errorf("entity not found")
		}
		return err
	}
	return nil
}
