package pipelineStore

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (ps *pipelineStore) ListOnBoardingPipelines(context context.Context, accountId string) (pipelines []models.WorkspacePipelineSummary, err error) {
	// In the future we can use different statements based on the db.Driver as per DB Engine

	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.Select(&pipelines, listOnBoardingPipelines, accountId)
		if err != nil {
			return
		}
	}
	return
}

var listOnBoardingPipelines = `
SELECT DISTINCT p.name, pv2.version
FROM triggers t
JOIN pipeline_versions pv on t.pipeline_version_id = pv.id
JOIN pipelines p on pv.pipeline_id = p.id
LEFT JOIN pipeline_activations pa on pa.pipeline_id = p.id 
LEFT JOIN pipeline_versions pv2 on pa.activated_version = pv2.id
WHERE p.account_id = $1 AND t.trigger_type = 'OnBoarding';
`
