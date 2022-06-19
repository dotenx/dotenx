package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
)

var createDatabase = `
CREATE DATABASE %s
`

func (store *projectStore) CreateProjectDatabase(ctx context.Context, accountId string, projectName string) error {

	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = fmt.Sprintf(createDatabase, "u"+accountId+"__"+projectName)
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt)
	if err != nil {
		fmt.Println("Error creating project database:", err)
		return err
	}
	return nil
}
