package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
)

func (ps *pipelineStore) GetPipelineIdByExecution(context context.Context, execId int) (id int, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.QueryRow(getPipelineIdByExecution, execId).Scan(&id)
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

var getPipelineIdByExecution = `
select pipeline_id
from executions
where id = $1
`
