package userManagementStore

import (
	"regexp"
	"runtime"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestCreateUserInfoTable(t *testing.T) {

	_, filename, _, _ := runtime.Caller(0)
	t.Logf("Current test filename: %s", filename)
	utils.RegisterCustomValidators()
	db, mock, err := utils.InitializeMockDB()
	t.Log(err)
	assert.NoError(t, err)
	defer db.Connection.Close()
	UserManagementStore := New()

	createTableQuery := `CREATE TABLE IF NOT EXISTS user_info (
		account_id              VARCHAR(64) PRIMARY KEY,
		password                VARCHAR(128),
		fullname                VARCHAR(64),
		email                   VARCHAR(64),
		created_at              VARCHAR(64),
		role                    VARCHAR(64)
		)`
	mock.ExpectExec(regexp.QuoteMeta(createTableQuery)).WithArgs().WillReturnResult(sqlmock.NewResult(0, 1))

	err = UserManagementStore.CreateUserInfoTable(db)
	t.Log(err)
	assert.NoError(t, err)

}
