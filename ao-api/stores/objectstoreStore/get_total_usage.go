package objectstoreStore

import (
	"context"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
)

// This method gets the total usage of the object store across all projects in the account
func (ds *objectstoreStore) GetTotalUsage(ctx context.Context, accountId string) (int, error) {
	getTotalUsage := `
SELECT COALESCE(SUM(size), 0)
FROM   object_store
WHERE account_id = $1
`
	var stmt string
	switch ds.db.Driver {
	case db.Postgres:
		stmt = getTotalUsage
	default:
		return 0, fmt.Errorf("driver not supported")
	}
	var count int
	err := ds.db.Connection.Get(&count, stmt, accountId)
	if err != nil {
		log.Println(err.Error())
		return 0, err
	}

	return count, nil
}
