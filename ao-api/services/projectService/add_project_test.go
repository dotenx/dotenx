package projectService

// import (
// 	"fmt"
// 	"regexp"
// 	"runtime"
// 	"testing"

// 	"github.com/DATA-DOG/go-sqlmock"
// 	"github.com/dotenx/dotenx/ao-api/models"
// 	"github.com/dotenx/dotenx/ao-api/pkg/utils"
// 	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
// 	"github.com/dotenx/dotenx/ao-api/stores/userManagementStore"
// 	"github.com/stretchr/testify/assert"
// )

// func TestAddProjectAction(t *testing.T) {

// 	_, filename, _, _ := runtime.Caller(0)
// 	t.Logf("Current test filename: %s", filename)

// 	// err := utils.Bootstrap()
// 	// t.Log(err)
// 	// assert.NoError(t, err)
// 	utils.RegisterCustomValidators()
// 	db, mock, err := utils.InitializeMockDB()
// 	// db, _, err := utils.InitializeMockDB()
// 	t.Log(err)
// 	assert.NoError(t, err)
// 	defer db.Connection.Close()

// 	ProjectStore := projectStore.New(db)
// 	UserManagementStore := userManagementStore.New()
// 	ProjectService := NewProjectService(ProjectStore, UserManagementStore)

// 	testProject := models.Project{
// 		Name:        "unit_test_5",
// 		Description: "just for unit testing",
// 		AccountId:   "test-account-id",
// 		Tag:         "1234567887654321",
// 	}

// 	// query := "^INSERT INTO projects [(]account_id, name, description, tag[)] VALUES ((.+), (.+), (.+), (.+))"
// 	insertQuery := "INSERT INTO projects (account_id, name, description, tag) VALUES ($1, $2, $3, $4)"
// 	createDbQuery := fmt.Sprintf("CREATE DATABASE %s WITH TEMPLATE template_base", utils.GetProjectDatabaseName(testProject.AccountId, testProject.Name))
// 	// createTableQuery := `
// 	// CREATE TABLE IF NOT EXISTS user_info (
// 	// account_id              VARCHAR(64) PRIMARY KEY,
// 	// password                VARCHAR(128),
// 	// fullname                VARCHAR(64),
// 	// email                   VARCHAR(64),
// 	// created_at              VARCHAR(64)
// 	// )
// 	// `
// 	// prep := mock.ExpectPrepare(query)
// 	mock.ExpectExec(regexp.QuoteMeta(insertQuery)).WithArgs(testProject.AccountId, testProject.Name, testProject.Description, testProject.Tag).WillReturnResult(sqlmock.NewResult(0, 1))
// 	mock.ExpectExec(regexp.QuoteMeta(createDbQuery)).WillReturnResult(sqlmock.NewResult(1, 0))
// 	//mock.ExpectExec(regexp.QuoteMeta(createTableQuery)).WillReturnResult(sqlmock.NewResult(2, 0))

// 	err = ProjectService.AddProject(testProject.AccountId, testProject)
// 	t.Log(err)
// 	assert.NoError(t, err)

// 	err = db.Connection.Close()
// 	assert.NoError(t, err)

// }
