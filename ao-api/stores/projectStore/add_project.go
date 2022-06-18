package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

var addProject = `
INSERT INTO projects (account_id, name, description)
VALUES ($1, $2, $3)
`

func (store *projectStore) AddProject(ctx context.Context, accountId string, project models.Project) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = addProject
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, accountId, project.Name, project.Description)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("Failed to add project")
	}
	return nil
}
