package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
)

func (ps *pipelineStore) GetInitialTask(context context.Context, executionId int) (int, error) {
	switch ps.db.Driver {
	case db.Postgres:
		var id int
		conn := ps.db.Connection
		err := conn.Get(&id, getInitialTask, executionId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				return 0, errors.New("not found")
			}
			return 0, err
		}
		return id, nil
	}
	return 0, nil

}

var getInitialTask = `
select ts.id id
from executions as e
join pipeline_versions as pv on e.pipeline_version_id = pv.id
join pipelines as p on pv.pipeline_id = p.id
join tasks as ts on ts.pipeline_version_id = pv.id
where e.id = $1
and not exists (select * from task_preconditions as tp where tp.task_id = ts.id);
`
