package databaseStore

import (
	"context"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

var deleteTable = `
DROP TABLE %s
`

func (ds *databaseStore) DeleteTable(ctx context.Context, accountId string, projectName string, tableName string) error {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)

	defer fn(db.Connection)
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}
	_, err = db.Connection.Exec(fmt.Sprintf(addTable, tableName))
	if err != nil {
		log.Println("Error dropping table:", err)
		return err
	}
	log.Println("Table dropped:", tableName)
	return nil
}
