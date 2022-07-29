package userManagementStore

import (
	"errors"
	"fmt"
	"log"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

// SetUserInfo stores user info in database
func (store *userManagementStore) SetUserInfo(db *dbPkg.DB, userInfo models.ThirdUser) (err error) {
	log.Println("trying to check user exist or not!")
	// we must check that this user doesn't register yet
	var cnt int
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		// Some third-party user registers with email and some others can register with oauth flow
		// if a third-party user register with oauth flow sometimes we haven't access to email
		// and also if a third-party user register with email we haven't access to account_id and we generate a new one
		// so we should check the user has email or not and then check existence
		if userInfo.Email != "" {
			err = db.Connection.Get(&cnt, countExistingUserByEmailStmt, userInfo.Email)
		} else {
			err = db.Connection.Get(&cnt, countExistingUserStmt, userInfo.AccountId)
		}
		if err != nil {
			return err
		}
		stmt = insertUserInfoStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	if cnt != 0 {
		return errors.New("user already registered")
	}

	log.Println("user exist!")

	_, err = db.Connection.Exec(stmt, userInfo.Email, userInfo.Password,
		userInfo.FullName, userInfo.AccountId, userInfo.CreatedAt, userInfo.UserGroup)
	if err != nil {
		return err
	}
	return
}

var insertUserInfoStmt = `
INSERT INTO user_info (email, password, fullname, account_id, created_at, user_group)
VALUES ($1, $2, $3, $4, $5, $6)
`
