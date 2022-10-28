package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/sirupsen/logrus"
)

// We first convert this to a parameterized query and then execute it with the values
var getRowByIdStmt = `
SELECT * FROM %s WHERE id = $1 %s;
`

/*
Note: if filters are provided, then rowId is ignored
*/

func (ds *databaseStore) SelectRowById(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag, tableName string, id int) (map[string]interface{}, error) {

	// Find the account_id and project_name for the project with the given tag to find the database name
	var res struct {
		AccountId   string `db:"account_id"`
		ProjectName string `db:"name"`
	}

	// TODO: Add a method GetDbInstanceByTag to dbutil to avoid this query
	err := ds.db.Connection.QueryRowx(findProjectDatabase, projectTag).StructScan(&res)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("database not found")
		}
		logrus.Error("error:", err)
		return nil, err
	}

	db, fn, err := dbutil.GetDbInstance(res.AccountId, res.ProjectName)

	defer fn(db.Connection)
	if err != nil {
		log.Println("Error getting database connection:", err)
		return nil, err
	}

	checkSecurityStmt := ""
	if useRowLevelSecurity && tpAccountId != "" {
		checkSecurityStmt = fmt.Sprintf(" AND creator_id = '%s'", tpAccountId)
	}

	stmt := fmt.Sprintf(getRowByIdStmt, tableName, checkSecurityStmt)

	row := make(map[string]interface{})
	conn := db.Connection
	err = conn.QueryRowx(stmt, id).MapScan(row)
	if err != nil {
		logrus.Error(err.Error())
		if err == sql.ErrNoRows {
			err = errors.New("not found")
		}
		return nil, err
	}

	return row, nil
}
