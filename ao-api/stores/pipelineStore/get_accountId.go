package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
)

func (ps *pipelineStore) GetAccountIdByExecutionId(context context.Context, executionId int) (string, error) {
	switch ps.db.Driver {
	case db.Postgres:
		var accountId string
		conn := ps.db.Connection
		err := conn.Get(&accountId, getAccountId, executionId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				return "", errors.New("account id not found")
			}
			return "", err
		}
		return accountId, nil
	}
	return "", nil
}

var getAccountId = `
select pv.account_id id
from executions as e
join pipelines as pv on e.pipeline_id = pv.id
where e.id = $1;`
