package workspacesService

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/pipelineStore"
)

type WorkspaceService interface {
	GetFlowByVersion(version int16, accountId, name string) (interface{}, int)
	GetListWorkspaceExecutions(accountId string) ([]models.WorkspaceExecutionSummary, error)
}

type workspaceManager struct {
	Store pipelineStore.PipelineStore
}

func NewWorkspaceService(store pipelineStore.PipelineStore) WorkspaceService {
	return &workspaceManager{Store: store}
}

var noContext = context.Background()
