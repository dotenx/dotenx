package projectStore

import (
	"context"
	"regexp"
	"runtime"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestListProjects(t *testing.T) {

	_, filename, _, _ := runtime.Caller(0)
	t.Logf("Current test filename: %s", filename)
	utils.RegisterCustomValidators()
	db, mock, err := utils.InitializeMockDB()
	t.Log(err)
	assert.NoError(t, err)
	defer db.Connection.Close()
	ProjectStore := New(db)
	testProject := models.Project{
		Name:        "unit_test_1",
		Description: "just for unit testing",
		AccountId:   "test-account-id",
		Tag:         "1234567887654321",
	}

	selectQuery := "Select id, name, description, tag, has_database, type, theme from projects WHERE account_id = $1"
	rows := sqlmock.NewRows([]string{"id", "name", "description", "tag", "has_database", "type"})
	mock.ExpectQuery(regexp.QuoteMeta(selectQuery)).
		WithArgs(testProject.AccountId).WillReturnRows(rows)

	_, err = ProjectStore.ListProjects(context.Background(), testProject.AccountId)
	t.Log(err)
	assert.NoError(t, err)
	// assert.NotEmpty(t, project)

}
