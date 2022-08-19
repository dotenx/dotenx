package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

func (store *projectStore) UpsertProjectDomain(ctx context.Context, projectDomain models.ProjectDomain) error {
	var updateProjectDomain = `
INSERT INTO project_domain (account_id, project_tag, internal_domain, external_domain, tls_arn, hosted_zone_id, ns_records)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (account_id, project_tag) DO UPDATE
SET internal_domain = EXCLUDED.internal_domain, external_domain = EXCLUDED.external_domain, tls_arn = EXCLUDED.tls_arn, hosted_zone_id = EXCLUDED.hosted_zone_id, ns_records = EXCLUDED.ns_records
`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = updateProjectDomain
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt, projectDomain.AccountId, projectDomain.ProjectTag, projectDomain.InternalDomain, projectDomain.ExternalDomain, projectDomain.TlsArn, projectDomain.HostedZoneId, pq.Array(projectDomain.NsRecords))
	if err != nil {
		logrus.Error(err.Error())
	}
	return err
}
