package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (ps *pipelineStore) GetInitialData(context context.Context, executionId int, accountId string) (InitialData models.InputData, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.Get(&InitialData, getInitialData, executionId, accountId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				return nil, errors.New("not found")
			}
		}
	}
	return
}

var getInitialData = `
SELECT initial_data FROM executions e
JOIN pipeline_versions pv ON pv.id = e.pipeline_version_id
JOIN pipelines p ON p.id = pv.pipeline_id
WHERE e.id = $1 AND p.account_id = $2
`
