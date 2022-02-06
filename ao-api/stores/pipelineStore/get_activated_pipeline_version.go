package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
)

func (ps *pipelineStore) GetActivatedPipelineVersionIdByEndpoint(context context.Context, accountId string, endpoint string) (int, error) {
	switch ps.db.Driver {
	case db.Postgres:
		var pipelineId int
		conn := ps.db.Connection
		err := conn.Get(&pipelineId, getActivatedPipelineVersionIdByEndpoint, accountId, endpoint)
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

func (ps *pipelineStore) GetActivatedPipelineVersionIdByName(context context.Context, accountId string, name string) (int, error) {
	switch ps.db.Driver {
	case db.Postgres:
		var pipelineId int
		conn := ps.db.Connection
		err := conn.Get(&pipelineId, getActivatedPipelineVersionIdByName, accountId, name)
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

//todo: re-write this like getActivatedPipelineVersionIdByName
var getActivatedPipelineVersionIdByEndpoint = `
SELECT pv.id AS id FROM pipeline_versions pv JOIN pipelines p
ON pv.pipeline_id = p.id
WHERE p.account_id = $1 AND p.endpoint = $2
AND EXISTS (
SELECT activated_version FROM	pipeline_activations pa
WHERE pa.pipeline_id = p.id AND pa.activated_version = pv.id
)
`

var getActivatedPipelineVersionIdByName = `
SELECT pv.id AS id 
FROM pipeline_versions pv 
JOIN pipelines p
ON pv.pipeline_id = p.id
JOIN pipeline_activations pa
ON pa.pipeline_id = p.id AND pa.activated_version = pv.id
WHERE p.account_id = $1 AND 
p.name = $2
`
