package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
)

func (ps *pipelineStore) GetTaskByPipelineId(context context.Context, executionId int, taskName string) (id int, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.QueryRow(getTaskByPipelineId, taskName, executionId).Scan(&id)
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

var getTaskByPipelineId = `
select id
from tasks
where name = $1 and pipeline_id = $2
LIMIT 1;
`
