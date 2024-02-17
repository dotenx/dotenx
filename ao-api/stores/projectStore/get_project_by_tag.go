package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

var getProjectByTag = `
Select id, name, account_id, description, tag, has_database, type, theme, ai_website_configuration from projects
WHERE tag = $1
`

func (store *projectStore) GetProjectByTag(ctx context.Context, tag string) (models.Project, error) {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getProjectByTag
	default:
		return models.Project{}, fmt.Errorf("driver not supported")
	}
	rows, err := store.db.Connection.Query(stmt, tag)
	if err != nil {
		return models.Project{}, err
	}
	defer rows.Close()
	var project models.Project
	for rows.Next() {
		if err := rows.Scan(&project.Id, &project.Name, &project.AccountId, &project.Description,
			&project.Tag, &project.HasDatabase, &project.Type, &project.Theme, &project.AIWebsiteConfiguration); err != nil {
			return models.Project{}, err
		}
	}
	return project, nil
}
