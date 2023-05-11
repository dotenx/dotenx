package projectService

import (
	"regexp"
	"runtime"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
	"github.com/dotenx/dotenx/ao-api/stores/userManagementStore"
	"github.com/stretchr/testify/assert"
)

func TestGetProject(t *testing.T) {

	_, filename, _, _ := runtime.Caller(0)
	t.Logf("Current test filename: %s", filename)
	utils.RegisterCustomValidators()

	// create a mock database connection
	db, mock, err := utils.InitializeMockDB()
	t.Log(err)
	assert.NoError(t, err)
	defer db.Connection.Close()

	// Stores
	ProjectStore := projectStore.New(db)
	UserManagementStore := userManagementStore.New()
	databaseStore := databaseStore.New(db)

	// Services
	ProjectService := NewProjectService(ProjectStore, UserManagementStore, databaseStore)

	// define the expected project data
	expectedProject := models.Project{
		Id:               1,
		Name:             "unit_test_1",
		Description:      "just for unit testing",
		Tag:              "1234567887654321",
		DefaultUserGroup: "", // if project hasn't database DefaultUserGroup is not important and its value is an empty string
		Type:             "website",
		Theme:            "blank",
		HasDatabase:      false,
	}

	// add the expected project to the mock database
	accountId := "test-account-id"
	sqlmock.NewRows([]string{"id", "name", "account_id", "description", "tag", "has_database", "type", "theme"}).
		AddRow(expectedProject.Id, expectedProject.Name, accountId, expectedProject.Description, expectedProject.Tag, expectedProject.HasDatabase, expectedProject.Type, expectedProject.Theme)
	expectedRows := sqlmock.NewRows([]string{"id", "name", "description", "tag", "has_database", "type", "theme"}).
		AddRow(expectedProject.Id, expectedProject.Name, expectedProject.Description, expectedProject.Tag, expectedProject.HasDatabase, expectedProject.Type, expectedProject.Theme)

	selectQuery := "Select id, name, description, tag, has_database, type, theme from projects WHERE account_id = $1 AND name = $2"
	mock.ExpectQuery(regexp.QuoteMeta(selectQuery)).
		WithArgs(accountId, expectedProject.Name).
		WillReturnRows(expectedRows)

	// call GetProjectByTag function to get the project by tag
	project, err := ProjectService.GetProject(accountId, expectedProject.Name)
	if err != nil {
		t.Fatalf("error getting project by tag: %s", err)
	}

	// assert that the fetched project is equal to the added project
	assert.EqualValues(t, expectedProject, project)
}
