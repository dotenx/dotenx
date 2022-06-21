package userManagementService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
	"github.com/dotenx/dotenx/ao-api/stores/userManagementStore"
)

func NewUserManagementService(store userManagementStore.UserManagementStore, projStore projectStore.ProjectStore) UserManagementService {
	return &userManagementService{Store: store, ProjStore: projStore}
}

type UserManagementService interface {
	GetUserInfo(tpEmail, projectTag string) (user *models.ThirdUser, err error)
	SetUserInfo(userInfo models.ThirdUser, projectTag string) (err error)
	UpdateUserInfo(userInfo models.ThirdUser, projectTag string) (err error)
	UpdatePassword(userInfo models.ThirdUser, projectTag string) (err error)
	DeleteUserInfo(tpAccountId, projectTag string) (err error)
}

type userManagementService struct {
	Store     userManagementStore.UserManagementStore
	ProjStore projectStore.ProjectStore
}

var noContext = context.Background()

func (ums *userManagementService) GetUserInfo(tpEmail, projectTag string) (user *models.ThirdUser, err error) {
	noContext := context.Background()

	project, err := ums.ProjStore.GetProjectByTag(noContext, projectTag)
	if err != nil {
		return &models.ThirdUser{}, err
	}
	db, closeFunc, err := dbutil.GetDbInstance(project.AccountId, project.Name)
	if err != nil {
		return &models.ThirdUser{}, err
	}
	defer closeFunc(db.Connection)

	return ums.Store.GetUserInfo(db, tpEmail)
}

func (ums *userManagementService) SetUserInfo(userInfo models.ThirdUser, projectTag string) (err error) {
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

	return ums.Store.SetUserInfo(db, userInfo)
}

func (ums *userManagementService) UpdateUserInfo(userInfo models.ThirdUser, projectTag string) (err error) {
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

	return ums.Store.UpdateUserInfo(db, userInfo)
}

func (ums *userManagementService) UpdatePassword(userInfo models.ThirdUser, projectTag string) (err error) {
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

	return ums.Store.UpdatePassword(db, userInfo)
}

func (ums *userManagementService) DeleteUserInfo(tpAccountId, projectTag string) (err error) {
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

	return ums.Store.DeleteUserInfo(db, tpAccountId)
}
