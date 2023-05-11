package projectStore

import (
	"context"
	"runtime"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestAddProject(t *testing.T) {

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
		Type:        "website",
		Theme:       "blank",
		HasDatabase: false,
	}

	insertQuery := `INSERT INTO projects \(account_id, name, description, tag, has_database, type, theme\)\.*`
	mock.ExpectExec(insertQuery).
		WithArgs(testProject.AccountId, testProject.Name, testProject.Description, testProject.Tag, testProject.HasDatabase, testProject.Type, testProject.Theme).
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = ProjectStore.AddProject(context.Background(), testProject.AccountId, testProject)
	t.Log(err)
	assert.NoError(t, err)

}
