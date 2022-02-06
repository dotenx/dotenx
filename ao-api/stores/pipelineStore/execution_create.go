package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (ps *pipelineStore) CreateExecution(context context.Context, execution models.Execution) (int, error) {
	switch ps.db.Driver {
	case db.Postgres:
		var id int
		conn := ps.db.Connection
		err := conn.QueryRow(createExecution, execution.PipelineVersionId, execution.StartedAt, execution.InitialData).Scan(&id)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				return 0, errors.New("pipeline not found")
			}
			return 0, err
		}
		return id, nil
	}
	return 0, nil

}

var createExecution = `
INSERT INTO executions (pipeline_version_id, started_at, initial_data)
VALUES ($1, $2, $3) RETURNING id
`
