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

func TestUpdatePassword(t *testing.T) {

	_, filename, _, _ := runtime.Caller(0)
	t.Logf("Current test filename: %s", filename)
	utils.RegisterCustomValidators()
	db, mock, err := utils.InitializeMockDB()
	t.Log(err)
	assert.NoError(t, err)
	defer db.Connection.Close()
	UserManagementStore := New()
	userInfo := models.ThirdUser{
		Email:     "unit_test@example.com",
		Password:  "unit_test_UNIT_TEST",
		FullName:  "unit test name",
		AccountId: "unit-test-id-123456",
		CreatedAt: time.Now().String(),
	}

	// todo: use test db instead of mock db

	selectQuery := "SELECT count(*) FROM user_info WHERE account_id = $1"
	rows := sqlmock.NewRows([]string{""})
	mock.ExpectQuery(regexp.QuoteMeta(selectQuery)).WithArgs(userInfo.AccountId).WillReturnRows(rows)
	updateRowQuery := "UPDATE user_info SET password = $1 WHERE account_id = $2"
	mock.ExpectExec(regexp.QuoteMeta(updateRowQuery)).WithArgs(userInfo.Password, userInfo.AccountId).WillReturnResult(sqlmock.NewResult(0, 1))

	err = UserManagementStore.UpdatePassword(db, userInfo)
	t.Log(err)
	assert.Error(t, sql.ErrNoRows)

}
