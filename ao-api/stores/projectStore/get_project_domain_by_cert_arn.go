package projectStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/lib/pq"
)

func (store *projectStore) GetProjectDomainByCertificateArn(ctx context.Context, certificateArn string) (models.ProjectDomain, error) {
	var getProjectDomain = `
SELECT account_id, project_tag, internal_domain, external_domain, tls_arn, tls_validation_record_name, tls_validation_record_value,
       cdn_arn, cdn_domain, s3_bucket, purchased_from_us, hosted_zone_id, registration_status, certificate_issued, nameservers, contact_info
FROM project_domain
WHERE tls_arn = $1
`
	var stmt string
	var pageDomain models.ProjectDomain
	switch store.db.Driver {
	case db.Postgres:
		stmt = getProjectDomain
	default:
		return pageDomain, fmt.Errorf("driver not supported")
	}

	var nsRecords pq.StringArray
	err := store.db.Connection.QueryRow(stmt, certificateArn).Scan(&pageDomain.AccountId, &pageDomain.ProjectTag, &pageDomain.InternalDomain, &pageDomain.ExternalDomain, &pageDomain.TlsArn,
		&pageDomain.TlsValidationRecordName, &pageDomain.TlsValidationRecordValue, &pageDomain.CdnArn, &pageDomain.CdnDomain, &pageDomain.S3Bucket, &pageDomain.PurchasedFromUs, &pageDomain.HostedZoneId,
		&pageDomain.RegistrationStatus, &pageDomain.CertificateIssued, &nsRecords, &pageDomain.ContactInfo)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("project_domain not found")
		}
	}
	pageDomain.Nameservers = ([]string)(nsRecords)

	return pageDomain, err
}
