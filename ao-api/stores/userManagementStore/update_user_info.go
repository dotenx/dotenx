package userManagementStore

import (
	"errors"
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *userManagementStore) UpdateUserInfo(db *dbPkg.DB, userInfo models.ThirdUser) (err error) {
	// we must check that this user was registered in past
	var cnt int
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		err = db.Connection.Get(&cnt, countExistingUserStmt, userInfo.AccountId)
		if err != nil {
			return err
		}
		stmt = updateUserInfoTableStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	if cnt == 0 {
		return errors.New("user not found")
	}

	_, err = db.Connection.Exec(stmt, userInfo.FullName, userInfo.AccountId)
	if err != nil {
		return err
	}
	return
}

var updateUserInfoTableStmt = `
UPDATE user_info
SET fullname = $1
WHERE account_id = $2
`
