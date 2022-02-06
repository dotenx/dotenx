package runnerstore

import (
	"context"
	"fmt"

	"github.com/rs/xid"
	"github.com/utopiops/automated-ops/ao-api/db"
)

func (r *runnerStore) Store(ctx context.Context, accountId, runnerType string) (string, error) {
	runnerId := xid.New().String()
	var stmt string
	switch r.db.Driver {
	case db.Postgres:
		stmt = storeQuery
	default:
		return "", fmt.Errorf("driver not supported")
	}
	res, err := r.db.Connection.Exec(stmt, runnerId, accountId, runnerType)
	if err != nil {
		return "", err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return "", fmt.Errorf("can not register new runner, try again")
	}
	return runnerId, nil
}

var storeQuery = `
INSERT INTO runner_queue VALUES ($1, $2, $3);`
