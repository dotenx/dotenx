package projectService

import (
	"context"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (ps *projectService) AddProject(accountId string, project models.Project) error {
	noContext := context.Background()

	project.Tag = utils.RandStringRunes(16, utils.FullRunes)
	// Add project to database
	if err := ps.Store.AddProject(noContext, accountId, project); err != nil {
		return err
	}

	// Create a database for the project
	if err := ps.Store.CreateProjectDatabase(noContext, accountId, project.Name); err != nil {
		return err
	}

	db, closeFunc, err := dbutil.GetDbInstance(accountId, project.Name)
	if err != nil {
		return err
	}
	pingErr := db.Connection.Ping()
	log.Println("pingErr:", pingErr)
	defer closeFunc(db.Connection)
	if err := ps.TpUserStore.CreateUserGroupTable(db); err != nil {
		return err
	}
	if err := ps.TpUserStore.CreateUserInfoTable(db); err != nil {
		return err
	}

	if project.DefaultUserGroup == "" {
		project.DefaultUserGroup = "users"
	}

	// todo: add rollback if database creation fails
	return ps.TpUserStore.SetDefaultUserGroup(db, models.UserGroup{Name: project.DefaultUserGroup})
}
