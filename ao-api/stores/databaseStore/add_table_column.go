package databaseStore

import (
	"context"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

var addColumn = `
ALTER TABLE %s ADD COLUMN %s %s;
`

func (ds *databaseStore) AddTableColumn(ctx context.Context, accountId string, projectName string, tableName string, columnName string, columnType string) error {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)

	defer fn(db.Connection)
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}
	_, err = db.Connection.Exec(fmt.Sprintf(addColumn, tableName, columnName, columnType))
	if err != nil {
		log.Println("Error adding table column:", err)
		return err
	}
	log.Println("Table column added:", tableName)
	return nil
}
