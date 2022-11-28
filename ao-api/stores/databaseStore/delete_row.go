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
var deleteRowByIdStmt = `
DELETE FROM %s WHERE id = $1 %s;
`

var deleteRowByConditionStmt = `
DELETE FROM %s
WHERE (%s) %s;
`

/*
Note: if filters are provided, then rowId is ignored
*/

func (ds *databaseStore) DeleteRow(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, rowId int, filters ConditionGroup) error {

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
		fmt.Println("error:", err)
		return err
	}
	fmt.Println("res:", res)

	db, fn, err := dbutil.GetDbInstance(res.AccountId, res.ProjectName)

	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}

	checkSecurityStmt := ""
	if useRowLevelSecurity && tpAccountId != "" {
		checkSecurityStmt = fmt.Sprintf(" AND creator_id = '%s'", tpAccountId)
	}

	var result sql.Result
	if len(filters.FilterSet) != 0 {
		whereCondition := ""
		signCnt := 1
		values := make([]interface{}, 0)
		returnValues, conditionStmt, err := getConditionStmt(filters, db, &signCnt, tableName, true)
		if err != nil {
			log.Println("Error getting condition statement:", err)
			return err
		}
		whereCondition = conditionStmt
		logrus.Info("final where condition stmt:", whereCondition)
		values = append(values, returnValues...)
		stmt := fmt.Sprintf(deleteRowByConditionStmt, tableName, whereCondition, checkSecurityStmt)
		fmt.Println("stmt:", stmt)
		result, err = db.Connection.Exec(stmt, values...)
		if err != nil {
			log.Println("Error deleting table row (by condition):", err)
			return err
		}
	} else {
		stmt := fmt.Sprintf(deleteRowByIdStmt, tableName, checkSecurityStmt)
		fmt.Println("stmt:", stmt)

		result, err = db.Connection.Exec(stmt, rowId)
		if err != nil {
			log.Println("Error deleting table row (by id):", err)
			return err
		}
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		err = errors.New("no rows deleted, may you haven't access to delete row(s)")
		return err
	}
	log.Println("Row deleted, row id is", rowId)
	return nil
}
