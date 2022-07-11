package userManagementStore

import (
	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

type UserManagementStore interface {
	CreateUserInfoTable(db *dbPkg.DB) (err error)
	GetUserInfo(db *dbPkg.DB, tpEmail string) (user *models.ThirdUser, err error)
	GetUserInfoById(db *dbPkg.DB, tpAccountId string) (user *models.ThirdUser, err error)
	SetUserInfo(db *dbPkg.DB, userInfo models.ThirdUser) (err error)
	UpdateUserInfo(db *dbPkg.DB, userInfo models.ThirdUser) (err error)
	UpdateUserRole(db *dbPkg.DB, userInfo models.ThirdUser) (err error)
	UpdatePassword(db *dbPkg.DB, userInfo models.ThirdUser) (err error)
	DeleteUserInfo(db *dbPkg.DB, tpAccountId string) (err error)
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
