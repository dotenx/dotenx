package databaseStore

import (
	"context"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

var addTable = `
CREATE TABLE IF NOT EXISTS %s (
	id SERIAL PRIMARY KEY,
	creator_id VARCHAR(64)
)
`

func (ds *databaseStore) AddTable(ctx context.Context, accountId string, projectName string, tableName string) error {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)

	defer fn(db.Connection)
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}
	_, err = db.Connection.Exec(fmt.Sprintf(addTable, tableName))
	if err != nil {
		log.Println("Error creating table:", err)
		return err
	}
	log.Println("Table created:", tableName)
	return nil
}
