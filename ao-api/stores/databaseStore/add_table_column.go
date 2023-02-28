package databaseStore

import (
	"context"
	"fmt"
	"log"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
)

var addColumn = `
ALTER TABLE %s ADD COLUMN %s %s;
`

func (ds *databaseStore) AddTableColumn(ctx context.Context, db *dbPkg.DB, accountId string, projectName string, tableName string, columnName string, columnType string) error {

	_, err := db.Connection.Exec(fmt.Sprintf(addColumn, tableName, columnName, columnType))
	if err != nil {
		log.Println("Error adding table column:", err)
		return err
	}
	log.Println("Table column added:", tableName)
	return nil
}
