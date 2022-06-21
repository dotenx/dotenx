package userManagementStore

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/dotenx/dotenx/ao-api/db"
	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"golang.org/x/crypto/bcrypt"
)

type UserManagementStore interface {
	CreateUserInfoTable(db *dbPkg.DB) (err error)
	GetUserInfo(db *dbPkg.DB, tpEmail string) (user *models.ThirdUser, err error)
	SetUserInfo(db *dbPkg.DB, userInfo models.ThirdUser) (err error)
	UpdateUserInfo(db *dbPkg.DB, userInfo models.ThirdUser) (err error)
	UpdatePassword(db *dbPkg.DB, userInfo models.ThirdUser) (err error)
	DeleteUserInfo(db *dbPkg.DB, tpAccountId string) (err error)
}

type userManagementStore struct {
}

func New() UserManagementStore {
	return &userManagementStore{}
}

func (store *userManagementStore) CreateUserInfoTable(db *dbPkg.DB) (err error) {
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = createUserInfoTableStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err = db.Connection.Exec(stmt)
	if err != nil {
		return err
	}
	return
}

// GetUserInfo retrieves user info based on accountId
func (store *userManagementStore) GetUserInfo(db *db.DB, tpEmail string) (user *models.ThirdUser, err error) {
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

// SetUserInfo stores user info in database
func (store *userManagementStore) SetUserInfo(db *db.DB, userInfo models.ThirdUser) (err error) {
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
	// the password must be hashed and then store in database
	hashedPassword, err := HashPassword(userInfo.Password)
	if err != nil {
		return err
	}
	createdAt := time.Now().String()

	_, err = db.Connection.Exec(stmt, userInfo.Email, hashedPassword,
		userInfo.FullName, userInfo.AccountId, createdAt)
	if err != nil {
		return err
	}
	return
}

func (store *userManagementStore) UpdateUserInfo(db *db.DB, userInfo models.ThirdUser) (err error) {
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

func (store *userManagementStore) UpdatePassword(db *db.DB, userInfo models.ThirdUser) (err error) {
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

	// the password must be hashed and then store in database
	hashedPassword, err := HashPassword(userInfo.Password)
	if err != nil {
		return err
	}

	_, err = db.Connection.Exec(stmt, hashedPassword, userInfo.AccountId)
	if err != nil {
		return err
	}
	return
}

func (store *userManagementStore) DeleteUserInfo(db *db.DB, tpAccountId string) (err error) {
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
		return errors.New("user not found")
	}

	_, err = db.Connection.Exec(stmt, tpAccountId)
	if err != nil {
		return err
	}
	return
}

// HashPassword function hashes a plain text password with bcrypt package and return result
func HashPassword(password string) (hashedPassword string, err error) {
	hashedPasswordBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", errors.New("unable to hash password")
	}

	hashedPassword = string(hashedPasswordBytes)
	return
}

var createUserInfoTableStmt = `
CREATE TABLE IF NOT EXISTS user_info (
account_id              VARCHAR(64) PRIMARY KEY,
password                VARCHAR(128),
fullname                VARCHAR(64),
email                   VARCHAR(64),
created_at              VARCHAR(64)
)
`

var countExistingUserStmt = `
SELECT count(*) FROM user_info
WHERE account_id = $1
`

var countExistingUserByEmailStmt = `
SELECT count(*) FROM user_info
WHERE email = $1
`

var insertUserInfoStmt = `
INSERT INTO user_info (email, password, fullname, account_id, created_at)
VALUES ($1, $2, $3, $4, $5)
`

var selectUserByIdentityCodeStmt = `
SELECT email, fullname, account_id, password, created_at FROM user_info
WHERE email = $1
`

var updateUserInfoTableStmt = `
UPDATE user_info
SET fullname = $1
WHERE account_id = $2
`

var updatePasswordStmt = `
UPDATE user_info
SET password = $1
WHERE account_id = $2
`

var deleteRowFromUserInfoTableStmt = `
DELETE FROM user_info
WHERE account_id = $1
`
