package databaseStore

import (
	"context"
	"database/sql"
	"errors"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/sirupsen/logrus"
)

var getIsPublicValueStmt = `
SELECT is_public
FROM   views
WHERE  name = $1;
`

func (ds *databaseStore) IsViewPublic(ctx context.Context, projectTag string, viewName string) (bool, error) {
	// Find the account_id and project_name for the project with the given tag to find the database name
	var res struct {
		AccountId   string `db:"account_id"`
		ProjectName string `db:"name"`
	}
	err := ds.db.Connection.QueryRowx(findProjectDatabase, projectTag).StructScan(&res)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("database not found")
		}
		logrus.Println("error:", err)
		return false, err
	}

	db, fn, err := dbutil.GetDbInstance(res.AccountId, res.ProjectName)
	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		logrus.Println("Error getting database connection:", err)
		return false, err
	}

	var isPublic bool
	conn := db.Connection
	err = conn.QueryRowx(getIsPublicValueStmt, viewName).Scan(&isPublic)
	if err != nil {
		logrus.Println("Error getting is_public field of view:", err)
		if err == sql.ErrNoRows {
			err = errors.New("not found")
		}
		return false, err
	}
	return isPublic, nil
}
