package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
)

func (ps *pipelineStore) GetLastExecution(context context.Context, pipelineId int) (id int, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.QueryRow(getLastExecution, pipelineId).Scan(&id)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return
		}
	}
	return
}

func (ps *pipelineStore) GetNumberOfExecutions(context context.Context, pipelineId int) (id int, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.QueryRow(getNumberOfExecutions, pipelineId).Scan(&id)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return
		}
	}
	return
}

var getLastExecution = `
select id
from executions
where pipeline_id = $1
ORDER BY started_at DESC
LIMIT 1;
`
var getNumberOfExecutions = `
select count(*)
from executions
where pipeline_id = $1;
`
