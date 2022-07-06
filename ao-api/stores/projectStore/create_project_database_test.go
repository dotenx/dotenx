package projectStore

import (
	"context"
	"fmt"
	"regexp"
	"runtime"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestCreateProjectDatabase(t *testing.T) {

	_, filename, _, _ := runtime.Caller(0)
	t.Logf("Current test filename: %s", filename)
	utils.RegisterCustomValidators()
	db, mock, err := utils.InitializeMockDB()
	t.Log(err)
	assert.NoError(t, err)
	defer db.Connection.Close()
	ProjectStore := New(db)
	testProject := models.Project{
		Name:      "unit_test_1",
		AccountId: "test-account-id",
	}

	createDbQuery := fmt.Sprintf("CREATE DATABASE %s WITH TEMPLATE template_base", utils.GetProjectDatabaseName(testProject.AccountId, testProject.Name))
	mock.ExpectExec(regexp.QuoteMeta(createDbQuery)).WillReturnResult(sqlmock.NewResult(0, 1))

	err = ProjectStore.CreateProjectDatabase(context.Background(), testProject.AccountId, testProject.Name)
	t.Log(err)
	assert.NoError(t, err)

}
