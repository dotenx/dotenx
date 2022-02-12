package pipelineStore

import (
	"context"
	"database/sql"
	"errors"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

// This method returns the list of the versions of a pipeline by it's name
func (ps *pipelineStore) ListPipelineVersionsByName(context context.Context, accountId string, name string) (pipelines []models.PipelineVersionSummary, err error) {
	// In the future we can use different statements based on the db.Driver as per DB Engine

	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.Select(&pipelines, listOnBoardingPipelineVersionsByName, accountId, name)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, errors.New("not found")
			}
			return
		}
	}
	return
}

var listOnBoardingPipelineVersionsByName = `
SELECT pv.version, pv.from_version FROM triggers t
JOIN pipeline_versions pv on t.pipeline_version_id = pv.id
JOIN pipelines p on pv.pipeline_id = p.id
WHERE p.account_id = $1 AND p.name = $2;
`
