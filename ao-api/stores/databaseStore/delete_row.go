package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

// We first convert this to a parameterized query and then execute it with the values
var deleteRow = `
DELETE FROM %s WHERE id = $1 %s;
`

func (ds *databaseStore) DeleteRow(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, id int) error {

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

	defer fn(db.Connection)
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}

	checkSecurityStmt := ""
	if useRowLevelSecurity && tpAccountId != "" {
		checkSecurityStmt = fmt.Sprintf(" AND creator_id = '%s'", tpAccountId)
	}

	stmt := fmt.Sprintf(deleteRow, tableName, checkSecurityStmt)
	fmt.Println("stmt:", stmt)

	result, err := db.Connection.Exec(stmt, id)
	if err != nil {
		log.Println("Error adding table column:", err)
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		err = errors.New("you haven't access to delete this row")
		return err
	}
	log.Println("Row deleted, row id is", id)
	return nil
}
