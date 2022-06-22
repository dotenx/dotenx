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
DELETE FROM %s WHERE id = $1
`

func (ds *databaseStore) DeleteRow(ctx context.Context, projectTag string, tableName string, id int) error {

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

	stmt := fmt.Sprintf(deleteRow, tableName)
	fmt.Println("stmt:", stmt)

	_, err = db.Connection.Exec(stmt, id)
	if err != nil {
		log.Println("Error adding table column:", err)
		return err
	}
	log.Println("Table column added:", tableName)
	return nil
}
