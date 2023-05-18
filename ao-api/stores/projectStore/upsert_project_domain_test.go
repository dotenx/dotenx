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
		InternalDomain:           "confident-red-db29aca71b",
		ExternalDomain:           "www.example.com",
		TlsArn:                   "my-dummy-tls-arn",
		TlsValidationRecordName:  "my-dummy-tls-record-name",
		TlsValidationRecordValue: "my-dummy-tls-record-value",
		CdnArn:                   "my-dummy-cdn-arn",
		CdnDomain:                "www.cdn.example.com",
		S3Bucket:                 "my-dummy-bucket-123456",
		AccountId:                "test-account-id",
		ProjectTag:               "4qbvpi7tpca1nr2v",
	}

	insertQuery := `INSERT INTO project_domain \(account_id, project_tag, internal_domain, external_domain, tls_arn, tls_validation_record_name, tls_validation_record_value, cdn_arn, cdn_domain, s3_bucket\)\.*`
	mock.ExpectExec(insertQuery).
		WithArgs(testProjectDomain.AccountId, testProjectDomain.ProjectTag, testProjectDomain.InternalDomain, testProjectDomain.ExternalDomain, testProjectDomain.TlsArn, testProjectDomain.TlsValidationRecordName, testProjectDomain.TlsValidationRecordValue, testProjectDomain.CdnArn, testProjectDomain.CdnDomain, testProjectDomain.S3Bucket).
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = ProjectStore.UpsertProjectDomain(context.Background(), testProjectDomain)
	t.Log(err)
	assert.NoError(t, err)

}
