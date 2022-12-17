package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

var ListProjectExternalDomains = `
SELECT project_tag, internal_domain, external_domain from project_domain
WHERE account_id = $1 AND external_domain != '';
`

func (store *projectStore) ListProjectExternalDomains(ctx context.Context, accountId string) ([]models.ProjectDomain, error) {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = ListProjectExternalDomains
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	rows, err := store.db.Connection.Query(stmt, accountId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var domains []models.ProjectDomain
	for rows.Next() {
		var domain models.ProjectDomain
		if err := rows.Scan(&domain.ProjectTag, &domain.InternalDomain, &domain.ExternalDomain); err != nil {
			return nil, err
		}
		domains = append(domains, domain)
	}
	return domains, nil
}
