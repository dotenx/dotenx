package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

var getProject = `
Select id, name, description, tag, has_database, type, theme, ai_website_configuration from projects
WHERE account_id = $1 AND name = $2
`

func (store *projectStore) GetProject(ctx context.Context, accountId string, projectName string) (models.Project, error) {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getProject
	default:
		return models.Project{}, fmt.Errorf("driver not supported")
	}
	rows, err := store.db.Connection.Query(stmt, accountId, projectName)
	if err != nil {
		return models.Project{}, err
	}
	defer rows.Close()
	var project models.Project
	for rows.Next() {
		if err := rows.Scan(&project.Id, &project.Name, &project.Description, &project.Tag,
			&project.HasDatabase, &project.Type, &project.Theme, &project.AIWebsiteConfiguration); err != nil {
			return models.Project{}, err
		}
	}
	return project, nil
}
