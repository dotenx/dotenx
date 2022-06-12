package pipelineStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *pipelineStore) GetPipelines(context context.Context, accountId string) ([]models.Pipeline, error) {
	res := make([]models.Pipeline, 0)
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		stmt := get_all_pipelines
		rows, err := conn.Queryx(stmt, accountId)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var cur models.Pipeline
			rows.StructScan(&cur)
			if err != nil {
				return nil, err
			}
			res = append(res, cur)
		}
	}
	return res, nil

}

const get_all_pipelines = `
SELECT * FROM pipelines
WHERE account_id = $1
`
