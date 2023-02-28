package databaseService

import (
	"context"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

func (ds *databaseService) AddTableColumn(accountId string, projectName string, tableName string, columnName string, columnType string) error {
	noContext := context.Background()
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)
	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}

	// Add table column to database
	return ds.Store.AddTableColumn(noContext, db, accountId, projectName, tableName, columnName, columnType)
}
