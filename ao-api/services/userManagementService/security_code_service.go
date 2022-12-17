package userManagementService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ums *userManagementService) SetSecurityCodeInfo(securityCode models.SecurityCode, projectTag string) (err error) {
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
	return ums.Store.SetSecurityCodeInfo(db, securityCode)
}

func (ums *userManagementService) GetSecurityCodeInfo(securityCodeStr, useCase, projectTag string) (securityCode models.SecurityCode, err error) {
	noContext := context.Background()

	project, err := ums.ProjStore.GetProjectByTag(noContext, projectTag)
	if err != nil {
		return models.SecurityCode{}, err
	}
	db, closeFunc, err := dbutil.GetDbInstance(project.AccountId, project.Name)
	if err != nil {
		return models.SecurityCode{}, err
	}
	defer closeFunc(db.Connection)
	return ums.Store.GetSecurityCodeInfo(db, securityCodeStr, useCase)
}

func (ums *userManagementService) DisableSecurityCode(securityCode, useCase, projectTag string) (err error) {
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
	return ums.Store.DisableSecurityCode(db, securityCode, useCase)
}
