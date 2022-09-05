package objectstoreStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

func (ds *objectstoreStore) ListFiles(ctx context.Context, accountId, projectTag string) ([]models.Objectstore, error) {

	listFiles := `
SELECT key, account_id, tpaccount_id, size, project_tag, url, is_public, user_groups
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
		logrus.Error(err.Error())
		return nil, err
	}
	defer rows.Close()
	files := []models.Objectstore{}
	for rows.Next() {
		var objectstore models.Objectstore
		var ug pq.StringArray
		if err := rows.Scan(&objectstore.Key, &objectstore.AccountId, &objectstore.TpAccountId, &objectstore.Size, &objectstore.ProjectTag, &objectstore.Url, &objectstore.IsPublic, &ug); err != nil {
			logrus.Error(err.Error())
			return nil, err
		}
		objectstore.UserGroups = ([]string)(ug)
		files = append(files, objectstore)
	}
	return files, nil
}
