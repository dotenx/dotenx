package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
)

func (ps *pipelineStore) GetNumberOfTasksForPipeline(context context.Context, pipelineId int) (count int, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.QueryRow(getNumberOfTasks, pipelineId).Scan(&count)
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

var getNumberOfTasks = `
SELECT count(*) FROM tasks
WHERE pipeline_id = $1;
`
