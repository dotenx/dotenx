package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
)

/*
This function deletes the project record from the database.
*/

func (store *projectStore) DeleteProjectByTag(ctx context.Context, projectTag string) error {
	deleteProject := `
		DELETE FROM projects
		WHERE tag = $1
`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = deleteProject
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, projectTag)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("entity not found")
	}
	return nil
}
