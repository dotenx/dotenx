package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

var ListProjects = `
Select id, name, description, tag, has_database, type, theme from projects
WHERE account_id = $1
`

func (store *projectStore) ListProjects(ctx context.Context, accountId string) ([]models.Project, error) {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = ListProjects
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
		if err := rows.Scan(&project.Id, &project.Name, &project.Description, &project.Tag, &project.HasDatabase, &project.Type, &project.Theme); err != nil {
			return nil, err
		}
		projects = append(projects, project)
	}
	return projects, nil
}
