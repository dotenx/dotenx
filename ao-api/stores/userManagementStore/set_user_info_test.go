package userManagementStore

import (
	"database/sql"
	"regexp"
	"runtime"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestSetUserInfo(t *testing.T) {

	_, filename, _, _ := runtime.Caller(0)
	t.Logf("Current test filename: %s", filename)
	utils.RegisterCustomValidators()
	db, mock, err := utils.InitializeMockDB()
	t.Log(err)
	assert.NoError(t, err)
	defer db.Connection.Close()
	UserManagementStore := New()
	userInfo1 := models.ThirdUser{ // with email
		Email:     "unit_test@example.com",
		Password:  "unit_test_UNIT_TEST",
		FullName:  "unit test name",
		AccountId: "unit-test-id-123456",
		CreatedAt: time.Now().String(),
	}

	// todo: use test db instead of mock db

	// userInfo2 := models.ThirdUser{ // without email
	// 	Password:  "unit_test_UNIT_TEST",
	// 	FullName:  "unit test name",
	// 	AccountId: "unit-test-id-123456",
	// 	CreatedAt: time.Now().String(),
	// }

	// createTableQuery := `CREATE TABLE IF NOT EXISTS user_info (
	// 	account_id              VARCHAR(64) PRIMARY KEY,
	// 	password                VARCHAR(128),
	// 	fullname                VARCHAR(64),
	// 	email                   VARCHAR(64),
	// 	created_at              VARCHAR(64)
	// 	)`
	// mock.ExpectExec(regexp.QuoteMeta(createTableQuery)).WithArgs().WillReturnResult(sqlmock.NewResult(0, 1))
	// err = UserManagementStore.CreateUserInfoTable(db)
	// t.Log(err)
	// assert.NoError(t, err)

	// for test user 1
	selectQuery := "SELECT count(*) FROM user_info WHERE email = $1"
	rows := sqlmock.NewRows([]string{""})
	mock.ExpectQuery(regexp.QuoteMeta(selectQuery)).WithArgs(userInfo1.Email).WillReturnRows(rows)
	insertRowQuery := "INSERT INTO user_info (email, password, fullname, account_id, created_at) VALUES ($1, $2, $3, $4, $5)"
	mock.ExpectExec(regexp.QuoteMeta(insertRowQuery)).WithArgs(userInfo1.Email, userInfo1.Password, userInfo1.FullName, userInfo1.AccountId, userInfo1.CreatedAt).WillReturnResult(sqlmock.NewResult(0, 1))
	err = UserManagementStore.SetUserInfo(db, userInfo1)
	t.Log(err)
	assert.Error(t, sql.ErrNoRows)

	// for test user 2
	// selectQuery2 := "SELECT count(*) FROM user_info WHERE account_id = $1"
	// rows = sqlmock.NewRows([]string{""})
	// mock.ExpectQuery(regexp.QuoteMeta(selectQuery2)).WithArgs(userInfo2.AccountId).WillReturnRows(rows)
	// insertRowQuery = "INSERT INTO user_info (email, password, fullname, account_id, created_at) VALUES ($1, $2, $3, $4, $5)"
	// mock.ExpectExec(regexp.QuoteMeta(insertRowQuery)).WithArgs(userInfo2.Email, userInfo2.Password, userInfo2.FullName, userInfo2.AccountId, userInfo2.CreatedAt).WillReturnResult(sqlmock.NewResult(0, 1))
	// err = UserManagementStore.SetUserInfo(db, userInfo2)
	// t.Log(err)
	// assert.NoError(t, err)
}
