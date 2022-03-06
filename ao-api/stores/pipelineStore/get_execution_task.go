package pipelineStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (ps *pipelineStore) GetTaskByExecution(context context.Context, executionId int, taskId int) (task models.TaskDetails, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		var body interface{}
		err = conn.QueryRow(getTaskByExecution, executionId, taskId).Scan(&task.Id, &task.Name, &task.Type, &body, &task.Timeout, &task.AccountId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return
		}
		var taskBody models.TaskBodyMap
		json.Unmarshal(body.([]byte), &taskBody)
		task.Body = taskBody
	}
	return

}

var getTaskByExecution = `
select t.id, t.name, t.task_type, t.body, t.timeout, p.account_id
from executions e
join pipeline_versions pv on e.pipeline_version_id = pv.id
join tasks t on t.pipeline_version_id = pv.id
join pipelines p on pv.pipeline_id = p.id
where e.id = $1 and t.id = $2
LIMIT 1;
`
