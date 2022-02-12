package runnerstore

import (
	"context"
	"fmt"

	"github.com/utopiops/automated-ops/ao-api/db"
)

func (r *runnerStore) GetAccountId(ctx context.Context, runnerId string) (string, error) {
	var stmt string
	switch r.db.Driver {
	case db.Postgres:
		stmt = getAccountId
	default:
		return "", fmt.Errorf("driver not supported")
	}
	res, err := r.db.Connection.Queryx(stmt, runnerId)
	if err != nil {
		return "", err
	}
	var accountId string
	err = res.Scan(&accountId)
	return accountId, err
}

var getAccountId = `
SELECT accountId FROM runner_queue WHERE runner_queue.runnerID = $1 `
