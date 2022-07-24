package userManagementService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ums *userManagementService) GetUserGroup(userGroupName, projectTag string) (userGroup *models.UserGroup, err error) {
	noContext := context.Background()

	project, err := ums.ProjStore.GetProjectByTag(noContext, projectTag)
	if err != nil {
		return nil, err
	}
	db, closeFunc, err := dbutil.GetDbInstance(project.AccountId, project.Name)
	if err != nil {
		return nil, err
	}
	defer closeFunc(db.Connection)
	return ums.Store.GetUserGroup(db, userGroupName)
}

func (ums *userManagementService) GetUserGroupForUser(tpAccountId, projectTag string) (user *models.UserGroup, err error) {
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

	userInfo, err := ums.Store.GetUserInfoById(db, tpAccountId)
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

func (ums *userManagementService) GetUserGroups(projectTag string) ([]*models.UserGroup, error) {
	noContext := context.Background()

	project, err := ums.ProjStore.GetProjectByTag(noContext, projectTag)
	if err != nil {
		return nil, err
	}
	db, closeFunc, err := dbutil.GetDbInstance(project.AccountId, project.Name)
	if err != nil {
		return nil, err
	}
	defer closeFunc(db.Connection)
	return ums.Store.GetAllUserGroups(db)
}

func (ums *userManagementService) GetDefaultUserGroup(projectTag string) (userGroup *models.UserGroup, err error) {
	noContext := context.Background()

	project, err := ums.ProjStore.GetProjectByTag(noContext, projectTag)
	if err != nil {
		return nil, err
	}
	db, closeFunc, err := dbutil.GetDbInstance(project.AccountId, project.Name)
	if err != nil {
		return nil, err
	}
	defer closeFunc(db.Connection)
	return ums.Store.GetDefaultUserGroup(db)
}

func (ums *userManagementService) SetDefaultUserGroup(userGroupName, projectTag string) (err error) {
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
	return ums.Store.SetDefaultUserGroup(db, models.UserGroup{Name: userGroupName})
}
