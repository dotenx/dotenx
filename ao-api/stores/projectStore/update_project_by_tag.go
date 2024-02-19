package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (store *projectStore) UpdateProjectByTag(ctx context.Context, projectTag string, project models.Project) error {
	var updateProjectByTag = `
UPDATE projects 
SET    description = $1, ai_website_configuration = $2
WHERE  tag = $3;
`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = updateProjectByTag
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, project.Description, project.AIWebsiteConfiguration, project.Tag)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return utils.ErrProjectNotFound
	}
	return nil
}
