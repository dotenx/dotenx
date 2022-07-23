package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *projectService) GetProject(accountId string, projectName string) (models.Project, error) {
	noContext := context.Background()
	project, err := ps.Store.GetProject(noContext, accountId, projectName)
	if err != nil {
		return models.Project{}, err
	}
	db, closeFunc, err := dbutil.GetDbInstance(project.AccountId, project.Name)
	if err != nil {
		return models.Project{}, err
	}
	defer closeFunc(db.Connection)
	user_group, err := ps.TpUserStore.GetDefaultUserGroup(db)
	if err != nil {
		return models.Project{}, err
	}
	project.DefaultUserGroup = user_group.Name
	return project, nil
}
