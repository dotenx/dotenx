package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *projectService) GetProjectByTag(tag string) (models.Project, error) {
	noContext := context.Background()

	project, err := ps.Store.GetProjectByTag(noContext, tag)
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
