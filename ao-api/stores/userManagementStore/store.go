package userManagementStore

import (
	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

type UserManagementStore interface {
	// user_info methods
	CreateUserInfoTable(db *dbPkg.DB) (err error)
	GetUserInfo(db *dbPkg.DB, tpEmail string) (user *models.ThirdUser, err error)
	GetUserInfoById(db *dbPkg.DB, tpAccountId string) (user *models.ThirdUser, err error)
	SetUserInfo(db *dbPkg.DB, userInfo models.ThirdUser) (err error)
	UpdateUserInfo(db *dbPkg.DB, userInfo models.ThirdUser) (err error)
	UpdateUserGroup(db *dbPkg.DB, userInfo models.ThirdUser) (err error)
	UpdatePassword(db *dbPkg.DB, userInfo models.ThirdUser) (err error)
	DeleteUserInfo(db *dbPkg.DB, tpAccountId string) (err error)

	// security_code methods
	CreateSecurityCodeTable(db *dbPkg.DB) (err error)
	SetSecurityCodeInfo(db *dbPkg.DB, securityCode models.SecurityCode) (err error)
	GetSecurityCodeInfo(db *dbPkg.DB, securityCodeStr, useCase string) (securityCode models.SecurityCode, err error)
	DisableSecurityCode(db *dbPkg.DB, securityCode, useCase string) (err error)

	// user group methods
	CreateUserGroupTable(db *dbPkg.DB) (err error)
	GetUserGroup(db *dbPkg.DB, name string) (userGroup *models.UserGroup, err error)
	GetAllUserGroups(db *dbPkg.DB) (userGroups []*models.UserGroup, err error)
	DeleteUserGroup(db *dbPkg.DB, name string) (err error)
	UpdateUserGroupList(db *dbPkg.DB, userGroup models.UserGroup) (err error)
	CreateUserGroup(db *dbPkg.DB, userGroup models.UserGroup) (err error)
	SetDefaultUserGroup(db *dbPkg.DB, userGroup models.UserGroup) (err error)
	GetDefaultUserGroup(db *dbPkg.DB) (userGroup *models.UserGroup, err error)
}

type userManagementStore struct {
}

func New() UserManagementStore {
	return &userManagementStore{}
}

var countExistingUserStmt = `
SELECT count(*) FROM user_info
WHERE account_id = $1
`

var countExistingUserByEmailStmt = `
SELECT count(*) FROM user_info
WHERE email = $1
`
