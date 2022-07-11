package userManagementStore

import (
	"errors"
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *userManagementStore) UpdatePassword(db *dbPkg.DB, userInfo models.ThirdUser) (err error) {
	// we must check that this user was registered in past
	var cnt int
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		err = db.Connection.Get(&cnt, countExistingUserStmt, userInfo.AccountId)
		if err != nil {
			return err
		}
		stmt = updatePasswordStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	if cnt == 0 {
		return errors.New("user not found")
	}

	_, err = db.Connection.Exec(stmt, userInfo.Password, userInfo.AccountId)
	if err != nil {
		return err
	}
	return
}

var updatePasswordStmt = `
UPDATE user_info
SET password = $1
WHERE account_id = $2
`
