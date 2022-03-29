package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (ps *pipelineStore) GetTasksWithStatusForExecution(noContext context.Context, executionId int) ([]models.TaskStatusSummery, error) {
	tasks := make([]models.TaskStatusSummery, 0)
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		rows, err := conn.Queryx(getTasksWithStatusForExecution, executionId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var taskId int
			var taskStatus string
			rows.Scan(&taskId, &taskStatus)
			tasks = append(tasks, models.TaskStatusSummery{Id: taskId, Status: taskStatus})
		}
	}
	return tasks, nil
}

var getTasksWithStatusForExecution = `
select task_id, status
from executions_status
where execution_id = $1
`
