package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *projectStore) UpsertProjectDomain(ctx context.Context, projectDomain models.ProjectDomain) error {
	var updateProjectDomain = `
INSERT INTO project_domain (account_id, project_tag, internal_domain, external_domain, tls_arn, tls_validation_record_name, tls_validation_record_value,
	cdn_arn, cdn_domain, s3_bucket, purchased_from_us, hosted_zone_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
ON CONFLICT (account_id, project_tag) DO UPDATE
SET internal_domain = EXCLUDED.internal_domain, external_domain = EXCLUDED.external_domain, tls_arn = EXCLUDED.tls_arn, tls_validation_record_name = EXCLUDED.tls_validation_record_name, tls_validation_record_value = EXCLUDED.tls_validation_record_value,
	cdn_arn = EXCLUDED.cdn_arn, cdn_domain = EXCLUDED.cdn_domain, s3_bucket = EXCLUDED.s3_bucket, purchased_from_us = EXCLUDED.purchased_from_us, hosted_zone_id = EXCLUDED.hosted_zone_id
`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = updateProjectDomain
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt, projectDomain.AccountId, projectDomain.ProjectTag, projectDomain.InternalDomain, projectDomain.ExternalDomain, projectDomain.TlsArn, projectDomain.TlsValidationRecordName,
		projectDomain.TlsValidationRecordValue, projectDomain.CdnArn, projectDomain.CdnDomain, projectDomain.S3Bucket, projectDomain.PurchasedFromUs, projectDomain.HostedZoneId)
	if err != nil {
		logrus.Error(err.Error())
	}
	return err
}
