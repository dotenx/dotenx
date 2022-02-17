package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
)

func (ps *pipelineStore) GetTaskByPipelineVersionId(context context.Context, executionId int, taskName string) (id int, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.QueryRow(getTaskByPipelineVersionId, taskName, executionId).Scan(&id)
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

var getTaskByPipelineVersionId = `
select id
from tasks
where name = $1 and pipeline_version_id = $2
LIMIT 1;
`
