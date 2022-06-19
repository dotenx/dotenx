package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *projectService) AddProject(accountId string, project models.Project) error {
	noContext := context.Background()

	// Add project to database
	if err := ps.Store.AddProject(noContext, accountId, project); err != nil {
		return err
	}

	// Create a database for the project
	if err := ps.Store.CreateProjectDatabase(noContext, accountId, project.Name); err != nil {
		return err
	}

	// todo: add rollback if database creation fails
	return nil
}
