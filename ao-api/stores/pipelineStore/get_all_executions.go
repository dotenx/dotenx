package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *pipelineStore) GetAllExecutions(context context.Context, pipelineId int) ([]models.Execution, error) {
	res := make([]models.Execution, 0)
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		rows, err := conn.Queryx(getAllExecution, pipelineId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var cur models.Execution
			rows.Scan(&cur.Id, &cur.PipelineVersionId, &cur.StartedAt, &cur.InitialData)
			if err != nil {
				return nil, err
			}
			res = append(res, cur)
		}
	}
	return res, nil
}

var getAllExecution = `
select id, pipeline_id, started_at, initial_data
from executions
where pipeline_id = $1;
`

func (ps *pipelineStore) GetExecutionDetailes(context context.Context, execId int) (models.Execution, error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		rows, err := conn.Queryx(getExecutionDetailes, execId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return models.Execution{}, err
		}
		defer rows.Close()
		for rows.Next() {
			var cur models.Execution
			rows.Scan(&cur.Id, &cur.PipelineVersionId, &cur.StartedAt, &cur.InitialData)
			if err != nil {
				return models.Execution{}, err
			}
			return cur, nil
		}
	}
	return models.Execution{}, errors.New("execution not found")
}

var getExecutionDetailes = `
select id, pipeline_id, started_at, initial_data
from executions
where id = $1;
`
