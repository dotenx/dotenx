package databaseStore

import (
	"context"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

var deleteColumn = `
ALTER TABLE %s DROP COLUMN %s;
`

func (ds *databaseStore) DeleteTableColumn(ctx context.Context, accountId string, projectName string, tableName string, columnName string) error {

	db, fn, err := dbutil.GetDbInstance(accountId, projectName)

	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}
	_, err = db.Connection.Exec(fmt.Sprintf(deleteColumn, tableName, columnName))
	if err != nil {
		log.Println("Error deleting table column:", err)
		return err
	}
	log.Println("Table column deleted:", tableName)
	return nil
}
