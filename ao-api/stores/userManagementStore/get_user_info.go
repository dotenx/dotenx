package userManagementStore

import (
	"database/sql"
	"errors"
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

// GetUserInfo retrieves user info based on accountId
func (store *userManagementStore) GetUserInfo(db *dbPkg.DB, tpEmail string) (user *models.ThirdUser, err error) {
	res := models.ThirdUser{}
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = selectUserByIdentityCodeStmt
	default:
		return &res, fmt.Errorf("driver not supported")
	}
	err = db.Connection.QueryRowx(stmt, tpEmail).StructScan(&res)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("user not found")
		}
		return
	}
	user = &res
	return
}

var selectUserByIdentityCodeStmt = `
SELECT email, fullname, account_id, password, created_at FROM user_info
WHERE email = $1
`
