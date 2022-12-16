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

func (store *projectStore) GetProjectDomain(ctx context.Context, accountId, projectTag string) (models.ProjectDomain, error) {
	var getProjectDomain = `
SELECT account_id, project_tag, internal_domain, external_domain, tls_arn, hosted_zone_id, ns_records FROM project_domain
WHERE account_id = $1 AND project_tag = $2
`
	var stmt string
	var pageDomain models.ProjectDomain
	switch store.db.Driver {
	case db.Postgres:
		stmt = getProjectDomain
	default:
		return pageDomain, fmt.Errorf("driver not supported")
	}

	var records pq.StringArray
	err := store.db.Connection.QueryRow(stmt, accountId, projectTag).Scan(&pageDomain.AccountId, &pageDomain.ProjectTag, &pageDomain.InternalDomain, &pageDomain.ExternalDomain, &pageDomain.TlsArn, &pageDomain.HostedZoneId, &records)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("project_domain not found")
		}
	}
	pageDomain.NsRecords = records
	return pageDomain, err
}
