package databaseStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/sirupsen/logrus"
)

var getCommentsOfTable = `
SELECT pg_catalog.obj_description('%s'::regclass, 'pg_class');
`

func (ds *databaseStore) IsTablePublic(ctx context.Context, projectTag string, tableName string) (bool, error) {
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

	var comment string
	err = db.Connection.QueryRow(fmt.Sprintf(getCommentsOfTable, tableName)).Scan(&comment)
	if err != nil {
		logrus.Error(err.Error())
		return false, err
	}
	logrus.Info("comments of table:", comment)
	var commentMap map[string]interface{}
	err = json.Unmarshal([]byte(comment), &commentMap)
	if err != nil {
		logrus.Error(err.Error())
		return false, err
	}
	if val, ok := commentMap["isPublic"].(bool); ok {
		return val, nil
	} else {
		logrus.Error("isPublic field not found")
		return false, errors.New("not found")
	}
}
