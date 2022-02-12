package workspacesService

import "github.com/utopiops/automated-ops/ao-api/models"

func (manager *workspaceManager) GetListWorkspaceExecutions(accountId string) ([]models.WorkspaceExecutionSummary, error) {
	return manager.Store.ListWorkspaceExecutions(noContext, accountId)
}
