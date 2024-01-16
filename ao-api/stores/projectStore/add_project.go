package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

var addProject = `
INSERT INTO projects (account_id, name, description, tag, has_database, type, theme, ai_website_configuration)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
`

func (store *projectStore) AddProject(ctx context.Context, accountId string, project models.Project) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = addProject
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, accountId, project.Name, project.Description,
		project.Tag, project.HasDatabase, project.Type, project.Theme, project.AIWebsiteConfiguration)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("failed to add project")
	}
	return nil
}
