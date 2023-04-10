package objectstoreStore

import (
	"context"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
)

// This method gets the total usage of the object store across all projects with given type in the account
func (ds *objectstoreStore) GetUsageByProjectType(ctx context.Context, accountId, projectType string) (int64, error) {
	getTotalUsage := `
SELECT COALESCE(SUM(size), 0)
FROM   object_store JOIN projects ON object_store.project_tag = projects.tag
WHERE  object_store.account_id = $1 AND projects.type = $2;
`
	var stmt string
	switch ds.db.Driver {
	case db.Postgres:
		stmt = getTotalUsage
	default:
		return 0, fmt.Errorf("driver not supported")
	}
	var count int64
	err := ds.db.Connection.Get(&count, stmt, accountId, projectType)
	if err != nil {
		log.Println(err.Error())
		return 0, err
	}

	return count, nil
}
