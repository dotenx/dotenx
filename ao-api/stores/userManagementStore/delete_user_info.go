package userManagementStore

import (
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (store *userManagementStore) DeleteUserInfo(db *dbPkg.DB, tpAccountId string) (err error) {
	// we must check that this user was registered in past
	var cnt int
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		err = db.Connection.Get(&cnt, countExistingUserStmt, tpAccountId)
		if err != nil {
			return err
		}
		stmt = deleteRowFromUserInfoTableStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	if cnt == 0 {
		return utils.ErrUserNotFound
	}

	_, err = db.Connection.Exec(stmt, tpAccountId)
	if err != nil {
		return err
	}
	return
}

var deleteRowFromUserInfoTableStmt = `
DELETE FROM user_info
WHERE account_id = $1
`
