package pipelineStore

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (ps *pipelineStore) ListWorkspaceExecutions(context context.Context, accountId string) (executions []models.WorkspaceExecutionSummary, err error) {
	// In the future we can use different statements based on the db.Driver as per DB Engine
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.Select(&executions, listWorkspaceExecutions, accountId)
		if err != nil {
			return
		}
	}
	return
}

var listWorkspaceExecutions = `
SELECT e.id, pv.from_version, pv.version, p.name, t.trigger_type, extract(epoch from e.started_at) started_at
FROM executions e
JOIN pipeline_versions pv ON e.pipeline_version_id = pv.id
JOIN pipelines p ON p.id = pv.pipeline_id
JOIN triggers t ON t.pipeline_version_id = pv.id
WHERE p.account_id = $1 AND t.trigger_type LIKE 'O%Boarding'
ORDER BY e.started_at DESC;
`
