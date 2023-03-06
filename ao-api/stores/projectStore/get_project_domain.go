package projectStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *projectStore) GetProjectDomain(ctx context.Context, accountId, projectTag string) (models.ProjectDomain, error) {
	var getProjectDomain = `
SELECT account_id, project_tag, internal_domain, external_domain, tls_arn, cdn_arn, cdn_domain, s3_bucket FROM project_domain
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

	err := store.db.Connection.QueryRow(stmt, accountId, projectTag).Scan(&pageDomain.AccountId, &pageDomain.ProjectTag, &pageDomain.InternalDomain, &pageDomain.ExternalDomain, &pageDomain.TlsArn, &pageDomain.CdnArn, &pageDomain.CdnDomain, &pageDomain.S3Bucket)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("project_domain not found")
		}
	}
	return pageDomain, err
}
