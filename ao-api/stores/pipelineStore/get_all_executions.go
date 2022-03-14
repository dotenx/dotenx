package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
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
		for rows.Next() {
			var cur models.Execution
			rows.StructScan(&cur)
			if err != nil {
				return nil, err
			}
			res = append(res, cur)
		}
	}
	return res, nil
}

var getAllExecution = `
select *
from executions
where pipeline_id = $1;
`
