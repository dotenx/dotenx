package runnerstore

import (
	"context"
	"fmt"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
)

func (r *runnerStore) Get(ctx context.Context, runnerId string) (string, error) {
	var stmt string
	switch r.db.Driver {
	case db.Postgres:
		stmt = getRunner
	default:
		return "", fmt.Errorf("driver not supported")
	}
	res, err := r.db.Connection.Queryx(stmt, runnerId)
	if err != nil {
		return "", err
	}
	var accountId string
	var queueType string
	for res.Next() {
		err = res.Scan(&accountId, &queueType)
	}
	//todo change this
	queueId := fmt.Sprintf("%s::%s", accountId, queueType)
	log.Println(queueId)
	return queueId, err
}

var getRunner = `
SELECT account_id, queue_type FROM runner_queue WHERE runner_queue.runner_id = $1 `
