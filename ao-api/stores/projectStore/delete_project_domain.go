package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

/*
This function deletes the domain associated with the project.

Note: The assumption is that each project has only one domain associated with it.
*/

func (store *projectStore) DeleteProjectDomain(ctx context.Context, projectDomain models.ProjectDomain) error {
	deleteDomain := `
		DELETE FROM project_domain
		WHERE project_tag = $1
`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = deleteDomain
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, projectDomain.ProjectTag)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("entity not found")
	}
	return nil
}
