package projectStore

import (
	"context"
	"errors"
	"regexp"
	"runtime"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestGetProjectDomain(t *testing.T) {

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

	selectQuery := "SELECT account_id, project_tag, internal_domain, external_domain, tls_arn, hosted_zone_id, ns_records FROM project_domain WHERE account_id = $1 AND project_tag = $2"
	rows := sqlmock.NewRows([]string{"account_id", "project_tag", "internal_domain", "external_domain", "tls_arn", "hosted_zone_id", "ns_records"})
	mock.ExpectQuery(regexp.QuoteMeta(selectQuery)).
		WithArgs(testProject.AccountId, testProject.Tag).WillReturnRows(rows)

	_, err = ProjectStore.GetProjectDomain(context.Background(), testProject.AccountId, testProject.Tag)
	t.Log(err)
	assert.Error(t, errors.New("project_domain not found"))
	// assert.NotEmpty(t, project)

}
