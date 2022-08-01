package objectstoreStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

// This method gets the total usage of the object store across all projects in the account
func (ds *objectstoreStore) ListFiles(ctx context.Context, accountId, projectTag string) ([]models.Objectstore, error) {

	logrus.Debug("accountId: ", accountId)
	logrus.Debug("projectTag: ", projectTag)

	listFiles := `
SELECT key, account_id, tpaccount_id, size, project_tag, access, url
FROM   object_store
WHERE account_id = $1 AND project_tag = $2
`

	var stmt string
	switch ds.db.Driver {
	case db.Postgres:
		stmt = listFiles
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	rows, err := ds.db.Connection.Query(stmt, accountId, projectTag)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	files := []models.Objectstore{}
	for rows.Next() {
		var objectstore models.Objectstore
		if err := rows.Scan(&objectstore.Key, &objectstore.AccountId, &objectstore.TpAccountId, &objectstore.Size, &objectstore.ProjectTag, &objectstore.Access, &objectstore.Url); err != nil {
			return nil, err
		}
		files = append(files, objectstore)
	}
	return files, nil
}
