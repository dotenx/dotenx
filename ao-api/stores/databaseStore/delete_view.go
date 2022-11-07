package databaseStore

import (
	"context"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

var deleteViewFromItsTableStmt = `
DELETE FROM views
WHERE name = $1;
`

func (ds *databaseStore) DeleteView(ctx context.Context, accountId string, projectName string, viewName string) error {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)
	defer fn(db.Connection)
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}

	result, err := db.Connection.Exec(deleteViewFromItsTableStmt, viewName)
	if err != nil {
		log.Println("Error deleting view:", err)
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		err = errors.New("not found")
		return err
	}
	log.Println("view deleted:", viewName)
	return nil
}
