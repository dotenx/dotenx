package userManagementStore

import (
	"errors"
	"regexp"
	"runtime"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestGetUserInfo(t *testing.T) {

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
		UserGroup: "role",
	}

	// todo: use test db instead of mock db

	selectQuery := "SELECT email, fullname, account_id, password, created_at, user_group FROM user_info WHERE email = $1"
	rows := sqlmock.NewRows([]string{"email", "fullname", "account_id", "password", "created_at", "role"})
	mock.ExpectQuery(regexp.QuoteMeta(selectQuery)).WithArgs(userInfo.Email).WillReturnRows(rows)

	_, err = UserManagementStore.GetUserInfo(db, userInfo.Email)
	t.Log(err)
	assert.Error(t, errors.New("user not found"))

}
