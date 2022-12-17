package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
)

// Todo: should not use accountId
func (ps *pipelineStore) GetPipelineIdByEndpoint(context context.Context, accountId string, endpoint string) (int, error) {
	switch ps.db.Driver {
	case db.Postgres:
		var pipelineId int
		conn := ps.db.Connection
		err := conn.Get(&pipelineId, getPipelineIdByEndpoint, accountId, endpoint)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				return 0, errors.New("pipeline not found")
			}
			return 0, err
		}
		return pipelineId, nil
	}
	return 0, nil
}

var getPipelineIdByEndpoint = `
SELECT id FROM pipelines
WHERE account_id = $1 AND endpoint = $2
`
