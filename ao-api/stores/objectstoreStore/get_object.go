package objectstoreStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

// This method gets the total usage of the object store across all projects in the account
func (ds *objectstoreStore) GetObject(ctx context.Context, accountId, projectTag, fileName string) (models.Objectstore, error) {

	getObject := `
SELECT key, account_id, tpaccount_id, project_tag, size, is_public, user_groups, url, display_name FROM object_store
WHERE account_id = $1 AND project_tag = $2 AND key = $3
`
	var stmt string
	switch ds.db.Driver {
	case db.Postgres:
		stmt = getObject
	default:
		return models.Objectstore{}, fmt.Errorf("driver not supported")
	}
	var objectStore models.Objectstore
	var ug pq.StringArray
	err := ds.db.Connection.QueryRowx(stmt, accountId, projectTag, fileName).Scan(&objectStore.Key, &objectStore.AccountId, &objectStore.TpAccountId, &objectStore.ProjectTag, &objectStore.Size, &objectStore.IsPublic, &ug, &objectStore.Url, &objectStore.DisplayName)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("entity not found")
		} else {
			logrus.Error(err.Error())
		}
		return models.Objectstore{}, err
	}
	objectStore.UserGroups = ([]string)(ug)

	return objectStore, nil
}
