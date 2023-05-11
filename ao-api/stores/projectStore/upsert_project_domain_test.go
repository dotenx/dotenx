package projectStore

import (
	"context"
	"runtime"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

func TestUpsertProjectDomain(t *testing.T) {

	_, filename, _, _ := runtime.Caller(0)
	t.Logf("Current test filename: %s", filename)
	utils.RegisterCustomValidators()
	db, mock, err := utils.InitializeMockDB()
	t.Log(err)
	assert.NoError(t, err)
	defer db.Connection.Close()
	ProjectStore := New(db)
	testProjectDomain := models.ProjectDomain{
		InternalDomain: "confident-red-db29aca71b",
		ExternalDomain: "www.example.com",
		TlsArn:         "my-dummy-tls-arn",
		AccountId:      "test-account-id",
		ProjectTag:     "4qbvpi7tpca1nr2v",
		HostedZoneId:   "id-dummy-hosted-zone",
		NsRecords:      []string{"us1.abc.com", "us3.abc.com"},
	}

	insertQuery := `INSERT INTO project_domain \(account_id, project_tag, internal_domain, external_domain, tls_arn, hosted_zone_id, ns_records\)\.*`
	mock.ExpectExec(insertQuery).
		WithArgs(testProjectDomain.AccountId, testProjectDomain.ProjectTag, testProjectDomain.InternalDomain, testProjectDomain.ExternalDomain, testProjectDomain.TlsArn, testProjectDomain.HostedZoneId, pq.Array(testProjectDomain.NsRecords)).
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = ProjectStore.UpsertProjectDomain(context.Background(), testProjectDomain)
	t.Log(err)
	assert.NoError(t, err)

}
