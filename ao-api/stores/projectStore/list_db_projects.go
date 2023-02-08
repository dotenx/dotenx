package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

var ListDBProjects = `
Select id, name, description, tag, type, theme from projects
WHERE account_id = $1 AND has_database = true
`

// ListDBProjects returns projects that have database
func (store *projectStore) ListDBProjects(ctx context.Context, accountId string) ([]models.Project, error) {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = ListDBProjects
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	rows, err := store.db.Connection.Query(stmt, accountId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var projects []models.Project
	for rows.Next() {
		var project models.Project
		if err := rows.Scan(&project.Id, &project.Name, &project.Description, &project.Tag, &project.Type, &project.Theme); err != nil {
			return nil, err
		}
		projects = append(projects, project)
	}
	return projects, nil
}
