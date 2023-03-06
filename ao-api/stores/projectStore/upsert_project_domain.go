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
INSERT INTO project_domain (account_id, project_tag, internal_domain, external_domain, tls_arn, cdn_arn, cdn_domain, s3_bucket)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (account_id, project_tag) DO UPDATE
SET internal_domain = EXCLUDED.internal_domain, external_domain = EXCLUDED.external_domain, tls_arn = EXCLUDED.tls_arn, cdn_arn = EXCLUDED.cdn_arn, cdn_domain = EXCLUDED.cdn_domain, s3_bucket = EXCLUDED.s3_bucket
`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = updateProjectDomain
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt, projectDomain.AccountId, projectDomain.ProjectTag, projectDomain.InternalDomain, projectDomain.ExternalDomain, projectDomain.TlsArn, projectDomain.CdnArn, projectDomain.CdnDomain, projectDomain.S3Bucket)
	if err != nil {
		logrus.Error(err.Error())
	}
	return err
}
