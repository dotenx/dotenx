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

func TestDeleteProjectDomain(t *testing.T) {

	_, filename, _, _ := runtime.Caller(0)
	t.Logf("Current test filename: %s", filename)
	utils.RegisterCustomValidators()
	db, mock, err := utils.InitializeMockDB()
	t.Log(err)
	assert.NoError(t, err)
	defer db.Connection.Close()
	ProjectStore := New(db)
	testProjectDomain := models.ProjectDomain{
		ProjectTag: "b4tova23tvh4szgv",
	}

	deleteQuery := "DELETE FROM project_domain WHERE project_tag = $1"
	mock.ExpectExec(regexp.QuoteMeta(deleteQuery)).
		WithArgs(testProjectDomain.ProjectTag).WillReturnResult(sqlmock.NewResult(0, 1))

	err = ProjectStore.DeleteProjectDomain(context.Background(), testProjectDomain)
	t.Log(err)
	assert.NoError(t, err)

}
