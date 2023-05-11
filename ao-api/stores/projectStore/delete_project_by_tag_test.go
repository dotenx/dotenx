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

func TestDeleteProjectByTag(t *testing.T) {

	_, filename, _, _ := runtime.Caller(0)
	t.Logf("Current test filename: %s", filename)
	utils.RegisterCustomValidators()
	db, mock, err := utils.InitializeMockDB()
	t.Log(err)
	assert.NoError(t, err)
	defer db.Connection.Close()
	ProjectStore := New(db)
	testProject := models.Project{
		Tag: "rv7y98viaz5wi3rc",
	}

	deleteQuery := "DELETE FROM projects WHERE tag = $1"
	mock.ExpectExec(regexp.QuoteMeta(deleteQuery)).
		WithArgs(testProject.Tag).WillReturnResult(sqlmock.NewResult(0, 1))

	err = ProjectStore.DeleteProjectByTag(context.Background(), testProject.Tag)
	t.Log(err)
	assert.NoError(t, err)

}
