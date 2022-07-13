package userManagementService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ums *userManagementService) GetUserGroupForUser(tpEmail, projectTag string) (user *models.UserGroup, err error) {
	noContext := context.Background()

	project, err := ums.ProjStore.GetProjectByTag(noContext, projectTag)
	if err != nil {
		return &models.UserGroup{}, err
	}
	db, closeFunc, err := dbutil.GetDbInstance(project.AccountId, project.Name)
	if err != nil {
		return &models.UserGroup{}, err
	}
	defer closeFunc(db.Connection)

	userInfo, err := ums.Store.GetUserInfo(db, tpEmail)
	if err != nil {
		return &models.UserGroup{}, err
	}
	return ums.Store.GetUserGroup(db, userInfo.UserGroup)
}

func (ums *userManagementService) CreateUserGroup(userGroup models.UserGroup, projectTag string) (err error) {
	noContext := context.Background()

	project, err := ums.ProjStore.GetProjectByTag(noContext, projectTag)
	if err != nil {
		return err
	}
	db, closeFunc, err := dbutil.GetDbInstance(project.AccountId, project.Name)
	if err != nil {
		return err
	}
	defer closeFunc(db.Connection)

	return ums.Store.CreateUserGroup(db, userGroup)
}

func (ums *userManagementService) DeleteUserGroup(userGroupName, projectTag string) (err error) {
	noContext := context.Background()

	project, err := ums.ProjStore.GetProjectByTag(noContext, projectTag)
	if err != nil {
		return err
	}
	db, closeFunc, err := dbutil.GetDbInstance(project.AccountId, project.Name)
	if err != nil {
		return err
	}
	defer closeFunc(db.Connection)

	return ums.Store.DeleteUserGroup(db, userGroupName)
}

func (ums *userManagementService) UpdateUserGroupList(userInfo models.UserGroup, projectTag string) (err error) {
	noContext := context.Background()

	project, err := ums.ProjStore.GetProjectByTag(noContext, projectTag)
	if err != nil {
		return err
	}
	db, closeFunc, err := dbutil.GetDbInstance(project.AccountId, project.Name)
	if err != nil {
		return err
	}
	defer closeFunc(db.Connection)

	return ums.Store.UpdateUserGroupList(db, userInfo)
}
