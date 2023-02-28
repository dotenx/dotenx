package databaseService

import (
	"context"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

func (ds *databaseService) AddTable(accountId string, projectName string, tableName string, isPublic, isWritePublic bool) error {
	noContext := context.Background()
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)
	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}

	// Add table to database
	return ds.Store.AddTable(noContext, db, accountId, projectName, tableName, isPublic, isWritePublic)
}
